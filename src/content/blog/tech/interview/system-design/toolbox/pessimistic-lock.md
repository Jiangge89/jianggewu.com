---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "concurrency", "tier1"]
title: "Pessimistic Lock Toolbox"
weight: 10
---

## Interview Trigger

```
High Contention / Inventory / Wallet / Stock / Seat Booking / Bank Transfer
```

## Optimistic vs Pessimistic

|  | Optimistic | Pessimistic |
| --- | --- | --- |
| Default assumption | Conflicts are rare | Conflicts are frequent |
| Locks upfront? | No | Yes |
| Requires Retry? | Yes | Generally no |
| Throughput | High | Lower |
| Deadlock risk | None | Yes |

---

## MySQL Implementation: SELECT ... FOR UPDATE

```sql
BEGIN;
SELECT * FROM account WHERE account_id='A' FOR UPDATE;  -- Row Lock
UPDATE account SET balance = balance - 80 WHERE account_id='A';
COMMIT;
```

---

## Deadlock

100% follow-up for Pessimistic Lock.

```
Tx1: Lock A → Waiting B
Tx2: Lock B → Waiting A
→ Deadlock → Database kills one Transaction
```

### How to avoid deadlock?

**Method 1:** Fixed lock ordering. Always lock smaller Account ID first, then larger.

**Method 2:** Reduce transaction duration. Don't hold locks too long (especially don't call external APIs within a transaction).

**Method 3:** Timeout. Wait 3 seconds → Fail.

---

## Coinbase Scenario

Transfer A → B requires locking both accounts. Recommendation: Always lock the smaller account ID first.

---

## Interview Follow-up

**Q1: When to use Optimistic?**

> When conflicts are rare and I want higher throughput.

**Q2: When to use Pessimistic?**

> When conflicts are frequent and retries would be expensive.

**Q3: Why not use a Redis Lock?**

> I'd prefer database row locks because they naturally participate in the same transaction and avoid keeping distributed locks in sync with the database.

Redis Locks are for protecting concurrent writes to non-database resources, or atomic operations across multiple databases.

---

## Real-World Example

Last concert ticket, 10,000 users competing simultaneously:

- **Optimistic:** 9,999 retries → massive contention
- **Pessimistic:** Lock → One User → Success → Others → Sold Out

---

## Selection Principle

```
Concurrency Control
├── Atomic SQL       (prefer when a single SQL statement can solve it)
├── Optimistic Lock  (low contention)
└── Pessimistic Lock (high contention)
```

> It depends on the contention level. If conflicts are rare, such as users updating their own wallets, optimistic locking provides better throughput. If many requests compete for the same resource, such as ticket booking, pessimistic locking is more appropriate because it prevents excessive retries.

---

## DB Lock vs Redis Lock

```
Concurrency Control
├── Database
│     ├── Optimistic Lock
│     ├── SELECT ... FOR UPDATE
│     └── Atomic SQL
└── Distributed Systems
      └── Redis Distributed Lock
```

**Redis Lock is not a replacement for database locks — it's needed when the resource spans beyond a single database.**

---

## Transaction vs Lock

Transaction and Lock are two independent tools that are often used together but neither contains the other.

**Transaction only needed (no concurrency):**

```sql
BEGIN;
UPDATE account SET balance = balance - 100 WHERE id = 'A';
UPDATE account SET balance = balance + 100 WHERE id = 'B';
COMMIT;
```

**Transaction + Lock (with concurrency):**

```sql
BEGIN;
SELECT ... FOR UPDATE;     -- Lock: solves Concurrency
UPDATE A; UPDATE B;        -- Transaction: solves Atomicity
COMMIT;
```
