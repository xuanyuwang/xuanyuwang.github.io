---
title: "Solving for the Class of Problems, Not the Instance"
description: When a specific bug points to a structural gap, the staff-level move is solving the general problem — even when the specific fix is faster
date: 2026-03-13
tags:
  - architecture
  - staff-engineering
---

A customer hits a query size limit. The immediate fix takes a day. The general fix takes two weeks. Which do you ship?

The instinct — and often the correct short-term call — is to ship the immediate fix. But if the specific problem is an instance of a structural gap, the immediate fix creates a pattern: every future instance gets its own patch, each slightly different, each addressing one trigger while leaving the underlying class of problems unresolved.

Staff-level engineering means recognizing when a specific bug is really a class of problems, and making the deliberate choice to solve the class — even when the specific fix is faster, simpler, and would close the ticket today.

This post uses a real case (reference data crossing database boundaries) to illustrate the difference, and why systematic evaluation of the solution space is itself a high-leverage engineering artifact.

## The instance vs. the class

The specific problem: an analytics system passed user IDs from PostgreSQL to ClickHouse via `WHERE user_id IN (...)` clauses in SQL text. A customer with 5,000+ agents generated a query that exceeded ClickHouse's 1MB query text limit.

The immediate fixes came in two rounds. First, increase ClickHouse's `max_query_size` setting to buy time. Then, a `ShouldQueryAllUsers` flag — when the filter resolves to "everyone," skip the WHERE clause entirely. Both shipped quickly. Both solved the triggering case.

But three scenarios remained unaddressed:

| Scenario | Why it still produces thousands of IDs |
|----------|----------------------------------------|
| Excluding deactivated users | Returns all active users (4,000 out of 5,000) |
| Large group expansion | Team with thousands of members |
| Limited-access manager with many reports | ACL returns all managed agent IDs |

These aren't "all users" — they're large subsets that can't use the flag but still exceed query size limits. The instance was fixed. The class was not.

The class of problems: **reference data from the application database needs to reach the analytics database, and embedding it in SQL text is architecturally wrong.** It works at small scale, degrades silently at medium scale, and fails hard at large scale. Any solution that operates within the "data embedded in query text" paradigm is a patch, not a fix.

## Systematic evaluation as a design artifact

The natural next step is to brainstorm solutions and pick the best one. The staff-level move is to evaluate the solution space systematically and *document the evaluation* — because the document itself becomes a design artifact that outlives the implementation.

I evaluated 10 approaches against consistent criteria: query size independence, performance impact, change complexity, compatibility with the existing client, and generalizability beyond user IDs.

| # | Solution | Solves the class? | Complexity | Outcome |
|---|----------|-------------------|------------|---------|
| 1 | Increase `max_query_size` | No | Low | Rejected: postpones, doesn't solve |
| 2 | `ShouldQueryAllUsers` flag | Only one case | Low | Already shipped |
| 3 | Batch queries + merge | Yes | High | Rejected: changes aggregation semantics |
| 4 | Subquery against PG | Yes | Medium | Rejected: ClickHouse can't query PG natively |
| 5 | ClickHouse dictionary | Yes | High | Rejected: requires DDL, ongoing sync |
| 6 | Temporary tables | Yes | Medium | Rejected: DDL permissions, session management |
| 7 | **External data tables** | **Yes** | **Low** | **Accepted** |
| 8 | Materialized view sync | Yes | Very high | Rejected: full sync pipeline for a filter parameter |
| 9 | Move filter to app layer | Yes | High | Rejected: loses aggregation efficiency |
| 10 | Hash/compress IDs | Partially | Medium | Rejected: reduces size, doesn't eliminate limit |

This evaluation did three things beyond selecting a solution:

1. **Eliminated options I initially favored.** I'd leaned toward temporary tables and ClickHouse dictionaries before evaluating them against the full criteria set. Systematic evaluation killed them on complexity, not on debate.
2. **Created a reviewable artifact.** Other engineers could challenge the criteria, suggest alternatives, or disagree with tradeoff assessments — all against a structured framework rather than in ad-hoc discussion.
3. **Documented why alternatives were rejected.** When someone asks "why not just increase the query size limit?" six months from now, the answer is in the evaluation, not in someone's memory.

## The winning solution and why "always" beat "sometimes"

ClickHouse's external data feature lets you upload a temporary in-memory table alongside a query. The data travels as binary payload, completely bypassing query text limits. The table exists only for that query's lifetime — no DDL, no persistent state, no cleanup.

```sql
-- Instead of embedding IDs in the query:
WHERE user_id IN ('id1', 'id2', ..., 'id5000')

-- Send them as a binary payload and join:
WHERE user_id IN (SELECT user_id FROM ext_user_ids)
```

We then faced a second design decision: use external tables only when the list is large (threshold approach), or use them for every query (always approach)?

Benchmarks on staging:

| User count | Inline `IN (...)` | External table | Speedup |
|------------|-------------------|----------------|---------|
| 10         | 62ms              | 79ms           | 0.8x   |
| 50         | 68ms              | 69ms           | 1.0x   |
| 500        | 91ms              | 73ms           | 1.2x   |
| 1,000      | 142ms             | 76ms           | 1.9x   |
| 5,000      | 397ms             | 82ms           | 4.8x   |

The crossover is around 50 users. Below that, external tables have slightly higher overhead (~17ms) from binary protocol setup. Above it, inline `IN` degrades as the SQL parser chews through increasingly large text, while external tables stay flat.

We chose "always." The reasoning:

- **One code path to test and reason about.** No threshold constant to tune, no "which path did this query take?" debugging.
- **The tradeoff is asymmetric.** The cost of "always" at small scale is 17ms. The cost of "sometimes" is branching logic, two test paths, and the risk of getting the threshold wrong.
- **Production p50 is 200+ users.** The small-scale overhead affects a minority of queries and is imperceptible to users.

This is a general principle: **when a simpler approach is slightly worse in the uncommon case and equivalent or better in the common case, choose simplicity.** The engineering cost of maintaining two paths almost always exceeds the performance cost of the slower path at small scale.

## Centralizing the fix for leverage

The analytics codebase had 30+ API endpoints constructing ClickHouse queries. The user filter logic had recently been consolidated into a shared function. This gave us a natural centralization point — change the shared function to return an external table alongside the SQL fragment, update each caller to pass it through.

The total change: ~200 lines in the shared layer, ~50 lines per caller site (mechanical), ~100 lines of test infrastructure. One architectural change that improved every endpoint simultaneously.

This is the leverage of solving for the class: a per-endpoint fix would have required 30+ independent changes, each with its own threshold logic and test coverage. The centralized fix was one design, one review, one rollout.

## Testing combinations, not features

During staging validation, we discovered that the existing `ShouldQueryAllUsers` flag (the instance fix) interacted poorly with external tables (the class fix). When the flag was true, the function returned no WHERE clause and no external table. But an admin with `exclude_deactivated=true` needed a user list even with the flag set — the flag short-circuited before exclusion logic ran.

This is a recurring pattern when class-level fixes coexist with instance-level patches: **the instance fix makes assumptions that the class fix violates.** Shadow mode — running both code paths and comparing results across 10,000+ queries — caught this before any customer was affected.

## The general pattern

When a specific bug points to a structural gap:

1. **Ask whether you're looking at an instance or a class.** The tell: if you can describe scenarios where the same problem recurs with different triggers, it's a class. Patch the instance for immediate relief, but plan the class-level fix.
2. **Evaluate the solution space systematically and document it.** The evaluation artifact often outlasts the implementation. It prevents re-litigation, onboards new engineers, and catches flawed assumptions before they become code.
3. **Prefer "always" over "sometimes" at the boundary.** Threshold-based branching between old and new paths adds complexity that compounds over time. If the new approach works at all scales (even if slightly slower at small scale), use it everywhere.
4. **Centralize the fix in the shared layer.** If 30 callers have the same problem, fix the abstraction they share — not each caller individually. This is where class-level thinking creates leverage.
5. **Test the class fix against existing instance patches.** Instance-level fixes make assumptions about the system. Class-level fixes change the system. The combinations will surprise you.
