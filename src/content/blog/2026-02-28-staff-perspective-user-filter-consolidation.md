---
title: "Who Sees What: Why Access Semantics Can't Be Left to Convention"
description: When the rules governing data visibility exist only as implicit conventions, they drift — silently, consequentially, and in ways that look like bugs but are really missing definitions
date: 2026-02-28
tags:
  - architecture
  - staff-engineering
---

# Who Sees What: Why Access Semantics Can't Be Left to Convention

Every multi-tenant system has a layer that answers a deceptively simple question: *given this user's identity and permissions, what data should they see?*

This isn't a "filter." It's the access semantics of your product — the rules that define the boundary between what each customer can and can't interact with. When those rules are correct, nobody notices. When they drift, you get silent data leakage, invisible correctness bugs, and customer trust erosion that's hard to recover from.

The dangerous thing about access semantics is that they feel like implementation details. Every team that builds a feature involving data visibility ends up encoding these rules somewhere — in a WHERE clause, in an API handler, in a utility function. And because the rules seem obvious ("of course an admin sees everyone"), they rarely get written down as a formal contract. They exist as convention.

Convention drifts.

## What access semantics actually govern

In the system I worked on, "user filtering" was the surface-level name, but the actual decisions it encoded were:

- **Visibility scope**: Which users' data does this request return? All agents? Only the requester's direct reports? Only members of selected teams?
- **Composition rules**: When a request specifies both individual users and groups, is the result a union or an intersection? This determines whether a manager sees "these people OR that team" vs. "these people who are also on that team."
- **Empty-state semantics**: What does "no filter" mean? For an admin, it means "everyone." For a limited-access manager, it might mean "only my reports" or "nothing at all." The answer depends on the access control model — and it has security implications.
- **Group expansion**: When you select a team, do you get all members? Only agents? Do nested groups expand recursively? Does expansion respect role constraints at every level?
- **Interaction with access control**: How do ACL restrictions compose with explicit filter selections? Can a user filter to see someone outside their ACL scope?

These aren't filter parameters. They're the product's access model, expressed through every API that returns user-scoped data.

## What happens when access semantics are implicit

The system had three separate implementations of these rules, spread across 30+ API endpoints and two query engines (PostgreSQL and ClickHouse). Each aimed to answer the same question — *who should this request return data for?* — but they diverged in ways that were silent, consequential, and invisible until customers noticed.

### The composition question was answered both ways

When a request included both explicit user selections and group selections, one implementation treated it as a union. Another treated it as an intersection. Neither was documented as a deliberate choice. The code just evolved differently in two places, and both "worked" in the sense that they returned data without errors.

The difference: a customer's analytics dashboard either showed data for 50 people or 12 people, depending on which API powered the widget. Both numbers looked plausible. Nobody noticed for months.

### "No filter" meant different things at different access levels

When an admin made a request with no filter, one implementation omitted the WHERE clause entirely (correct, efficient). Another resolved "no filter" to a list of all user IDs and passed them as query parameters. Both returned the same data — until a customer had 5,000+ agents and the generated SQL exceeded the analytics database's 1MB query size limit.

Same semantic intent. Different implementation strategy. The divergence was invisible until a customer's scale exposed it.

### ACL boundaries were enforced inconsistently

The hardest questions were around access control:
- What does "empty filter" mean when ACL restricts your view to a subset of users?
- Should a manager with no direct reports see empty results or get an error?
- When expanding a team group, do you respect role constraints (agents only) at every level?

Each implementation answered these differently. The answers weren't in documentation or specs — they were embedded in `if/else` chains and test fixtures. Some answers had security implications (a limited-access user seeing data outside their scope). None of the divergences produced errors. They just produced subtly wrong results.

## Making access semantics explicit

The fix wasn't primarily a code change. It was making the implicit explicit.

### A behavioral standard as source of truth

Before writing any code, I wrote a behavioral standard document — implementation-agnostic, describing the expected behavior across every combination of inputs:

- 4 access levels (root, ACL-disabled, limited with reports, limited without)
- 3 filter types (user selection, group selection, combined)
- 2 group types (team groups, virtual/dynamic groups)
- Special flags (exclude deactivated, agents only, include dev users)

For each combination: what's the expected visibility scope? When do we return empty results? What are the security invariants?

This document became the contract. When three implementations disagreed, we could point to the standard instead of debating which legacy behavior was "more correct." It also served as onboarding material — new engineers could understand the access model without reverse-engineering three codebases.

### Inventorying the drift

Comparing the three implementations against the standard revealed 5 behavioral divergences. Most were silent — they produced wrong results without errors. One (the union vs. intersection mismatch) affected production analytics for a customer. Each got a severity rating, a fix plan, and a test case.

The inventory itself was valuable: it turned "the access logic is inconsistent" from a vague concern into a concrete list of known deviations with measurable impact.

### Incremental convergence, not a rewrite

The temptation was to unify everything into one clean implementation immediately. Instead:

1. **Fix the security-relevant divergences first** — the union/intersection mismatch and the ACL boundary issues, gated behind feature flags
2. **Solve the scaling problem independently** — the query size limit was a real customer issue that couldn't wait for a full migration (this became its own project using ClickHouse external tables)
3. **Migrate endpoints one at a time** — each migration was a small, testable change verified against the behavioral standard

This approach was slower than a rewrite but dramatically safer. Each step delivered value independently, and any step could be rolled back without affecting the others.

## Why access semantics deserve special treatment

### They're a security boundary, not a convenience feature

When filter logic is "just" a utility function, it gets treated with utility-function rigor: it works, it has some tests, it ships. But access semantics define what data crosses trust boundaries. A bug in a sorting function shows items in the wrong order. A bug in access semantics shows a customer data they shouldn't see — or hides data they need.

The review standard for access semantics should match the review standard for authentication and authorization, because that's what they are.

### They compound across endpoints

One implementation with a subtle ACL bug is a bug. Thirty endpoints with three different interpretations of ACL rules is a systemic risk. Each new feature that touches user-scoped data either inherits an existing interpretation (which one?) or invents a new one. Without a standard, the drift accelerates.

### They're invisible when wrong

Access semantics bugs don't produce errors. They produce data — just the wrong data, or the wrong amount of data. A dashboard that shows 50 users instead of 12 still renders. An analytics page that includes deactivated users still loads. The customer might notice eventually, or they might make decisions on incorrect data for months.

This invisibility is what makes convention-based access semantics so dangerous. The system never tells you it's wrong.

## The general pattern

If your system has logic that governs data visibility across multiple services or endpoints:

1. **Treat it as access semantics, not as filtering.** The framing matters. "User filter" sounds like a utility. "Access semantics" sounds like something that needs a specification, review, and tests — because it does.
2. **Write the behavioral standard before changing code.** Implementation-agnostic, covering all input combinations and edge cases. This is your source of truth and your review artifact.
3. **Inventory the drift.** Compare every implementation against the standard. Rate severity. Some divergences are silent correctness bugs; some have security implications; some are features you need to preserve.
4. **Fix security-relevant divergences immediately.** Don't wait for a full migration. Ship targeted fixes behind feature flags.
5. **Converge incrementally.** One caller at a time, verified against the standard. Resist the big-bang rewrite — the risk profile of access semantics changes doesn't tolerate "we'll fix it if something breaks."
6. **Test combinations, not features.** Access semantics interact with other system behaviors (caching, query optimization, feature flags). Test the intersections, not just each dimension in isolation.
