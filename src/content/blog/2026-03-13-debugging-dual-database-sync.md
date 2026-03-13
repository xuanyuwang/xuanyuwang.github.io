---
title: "The Trap of Async Side Effects in Dual-Write Systems"
description: Why fire-and-forget propagation between databases creates compounding bugs that intuitive fixes make worse
date: 2026-03-13
tags:
  - debugging
  - distributed-systems
  - staff-engineering
---

Many systems write to a primary database synchronously and then propagate changes to a secondary store — an analytics database, a search index, a cache — via async side effects. The pattern is simple, well-understood, and almost always ships with a subtle structural flaw: **the side effect captures a moment in time that may no longer be true when it executes.**

This isn't a theoretical concern. It's a bug factory. And the intuitive fixes — "use a better timestamp," "retry on failure" — tend to address symptoms while leaving the structural problem intact. Worse, multiple bugs with the same root cause can produce identical symptoms, making it easy to declare victory after fixing only one.

This post uses a real dual-write system (PostgreSQL + ClickHouse) to illustrate why async side effects are structurally dangerous, why the first fix usually fails, and what a principled approach looks like.

## The structural problem

The pattern looks like this:

1. API request arrives
2. Write to the primary database (PostgreSQL) inside a transaction
3. After commit, fire an async goroutine that reads the record and writes it to the secondary store (ClickHouse)

The secondary store uses a versioning mechanism (ClickHouse's ReplacingMergeTree with `update_time`) to handle duplicate writes — it keeps the row with the highest version. In this system, `update_time` was set to `time.Now()` at the moment of the ClickHouse write.

Two properties of this pattern create the trap:

**The async work races with other operations.** If two API calls happen in quick succession (Update then Submit), their async goroutines may complete in reverse order. The goroutine that started first can finish last — and because it captured or read data before the second operation committed, it writes *stale* data with a *later* timestamp. The versioning mechanism keeps the stale row because it has the higher version.

**The side effect captures a snapshot, not a reference.** The async work typically captures the record object in a closure or reads from the database before the next operation's transaction commits. Either way, it operates on data that has already been superseded. This is the fundamental issue: the side effect's view of reality is detached from the primary database's current state.

## Why intuitive fixes fail

When this bug surfaced — customers seeing stale data in analytics dashboards while the primary application showed correct state — the first instinct was to fix the versioning: use the primary database's `updated_at` instead of `time.Now()` as the ClickHouse version column.

The logic seemed sound: if Submit's `updated_at` is always later than Update's, the version ordering would match the data ordering. But this fix failed because **the async work captured the record object in a closure**. The goroutine used the stale snapshot from before the transaction — including the stale `updated_at`. Changing the timestamp source didn't help because the data itself was stale.

This is the pattern to watch for: **when the root cause is stale data, no amount of metadata correction fixes the problem.** The fix addressed a downstream symptom (wrong version ordering) while the upstream problem (reading superseded state) persisted.

## The real fix: never trust the closure

The correct fix had two parts:

1. **Move secondary-store schema writes inside the primary transaction**, so they commit atomically with the primary data
2. **Make the async work re-read from the primary database** instead of using closure-captured state

```go
func UpdateRecordAtomic(...) {
    var asyncWork func()

    db.Transaction(func(tx) {
        UpdateRecordInDB(tx, ...)
        WriteAnalyticsData(tx, ...)

        asyncWork = func() {
            // Re-read from DB, not closure
            record := ReadFromDB(recordID)
            WriteToClickHouse(record)
        }
    })

    asyncWorkQueue.Execute(asyncWork)
}
```

Now even if goroutines run out of order, both re-read from the primary database and see the same committed state. The side effect is no longer detached from reality.

## Identical symptoms, different bugs

While load-testing the fix above, a second race condition emerged — this time in the primary database itself.

The ORM's `Save()` persisted the entire struct, not just modified fields. When Update and Submit ran concurrently, Update could overwrite Submit's changes:

```
T1  Update: reads record (submitted_at=NULL)
T2  Submit: reads record (submitted_at=NULL)
T3  Submit: sets submitted_at=NOW(), saves entire struct
T4  Update: modifies scores, saves entire struct
    ^ Overwrites submitted_at back to NULL
```

This is a classic lost-update problem. The fix was partial updates — using the ORM's field-exclusion mechanism so each operation only writes the fields it owns.

The critical insight: **this bug produced the exact same symptom as the async ordering bug** (missing submission data in analytics). If we'd stopped after the first fix, the intermittent failures would have continued and we'd have doubted whether the async fix was correct. Load testing with high concurrency was what separated the two bugs into distinguishable failure modes.

## Verifying the fix: quantify the residual

After deploying both fixes behind a feature flag and rolling out gradually, production verification across ~3,000 records over 39 days showed:

| Metric | Result |
|--------|--------|
| Score mismatches (primary vs. analytics) | **0** |
| Submitter mismatches | **0** |
| Analytics missing submission state | 26 (0.87%) |

The 0.87% residual came from users clicking Save then Submit in rapid succession in the UI — fast enough that the first goroutine's re-read still happened before the second transaction committed. All 26 had correct data in the primary database. The analytics copy was stale but bounded by human interaction speed.

An initial assumption was that the residual came from automated batch processing (which would call both APIs programmatically with minimal delay). Code review disproved this: the batch code path writes synchronously to both stores in a single function — no async goroutines, no race possible. **Production data analysis is powerful, but you must ground it in the actual code to avoid misleading conclusions.**

## The general pattern

Async side effects in dual-write systems are structurally prone to three compounding problems:

1. **Stale closures.** Async work that captures state at dispatch time operates on a snapshot that may be superseded by the time it executes. The fix: never trust captured state. Re-read from the source of truth.

2. **Version inversion.** When the secondary store uses write-time metadata (like `time.Now()`) for ordering, write order determines truth — not data order. A late-arriving goroutine with stale data "wins" over an earlier goroutine with correct data. The fix: derive versions from the source of truth, not from the writer.

3. **Lost updates in the primary.** Full-struct persistence (`Save()` in ORMs) is a lost-update bug waiting for concurrent writes. This bug often hides behind the async ordering bug because both produce the same symptoms. The fix: partial updates — each operation writes only the fields it owns.

These bugs compound because they produce identical symptoms. The discipline required is:

- **Don't stop at the first fix.** Load-test under concurrency to surface overlapping failure modes.
- **Build comparison tooling early.** A tool that diffs the primary and secondary store for a single record is invaluable for both debugging and production validation.
- **Quantify and document the residual.** After fixing what you can, measure what remains. "0.87% of records have stale analytics data under specific UI interaction patterns" is a known, bounded risk. "Sometimes the data is wrong" is not.
