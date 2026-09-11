---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "distributed", "tier3"]
title: "Saga Toolbox"
weight: 13
---

## What is Saga?

> **Saga is a pattern for maintaining consistency across multiple services using local transactions and compensation instead of one global transaction.**

## Interview Trigger

```
Multiple Services / Multiple Databases / Distributed Workflow
Payment / Order / Wallet / Inventory / Shipping
```

Each service has its own DB; you cannot do a single Transaction across DBs → Saga.

---

## Why do we need Saga?

Buy BTC workflow:

```
Create Order → Deduct Wallet → Execute Trade → Reward User
```

If Trade fails, Order and Wallet have already been committed and cannot be rolled back. The only option is compensation: `Refund Wallet → Cancel Order`.

---

## Compensation

Not a Database Rollback — it's a Business Undo:

| Forward | Compensation |
| --- | --- |
| Reserve Balance | Release Balance |
| Withdraw | Deposit |
| Create Order | Cancel Order |
| Reserve Inventory | Release Inventory |

Some operations have no true Undo (e.g. Send Email) — you can only send a corrective notification.

---

## Two Implementation Approaches

### Choreography

No Coordinator, fully Event Driven:

```
Order Service → OrderCreated
  → Wallet Service → BalanceReserved
    → Trade Service → TradeCompleted
```

On failure, Trade publishes `TradeFailed`; Wallet listens and refunds; Order listens and cancels.

Pros: Loose coupling. Cons: Event flow becomes increasingly complex as services grow.

### Orchestration (Recommended)

Add a Saga Coordinator:

```
Coordinator → Call Order → Call Wallet → Call Trade → Call Reward
```

On failure, Coordinator tells Wallet to Refund and Order to Cancel.

Pros: Clear flow / Easy retry / Easy monitoring. Cons: Coordinator needs to maintain state.

---

## Relationship Between Saga and Outbox

They are not mutually exclusive:

- **Within a single Service:** `Update Wallet → Publish WalletUpdated` → needs **Outbox**
- **Across the full business workflow:** `Transfer → Reward → Notification` → needs **Saga**

In practice:

```
Within a service: Transaction → Outbox → Kafka
Across the system: Saga
```

---

## How to handle failure?

Trade fails → Coordinator starts Compensation → Wallet Refund.

If Refund also fails? → Retry.

Therefore Compensation must be **Idempotent**.

---

## Saga vs 2PC

|  | 2PC | Saga |
| --- | --- | --- |
| Consistency | Strong | Eventual |
| Performance | Lower | Higher |
| Blocking | Yes | No |
| Availability | Lower | Higher |
| Rollback | Transaction | Compensation |

Modern internet systems generally use Saga.

---

## Saga's Biggest Limitation

Every step must be compensable. For example, Withdraw can be compensated with Deposit, but Email Sent has no true Undo.

---

## Standard Interview Answer

> How would you implement a purchase workflow across multiple services?

> I'd use the Saga pattern. Each service executes its own local transaction. If a later step fails, previously completed services execute compensating actions. I prefer orchestration for financial workflows because it provides better visibility, retries, and monitoring.

---

## Full Consistency Architecture for Financial Systems

```
Transaction
  → Update Business Data
    → Outbox Table
      → CDC (Binlog)
        → Kafka
          → Idempotent Consumers
            → Multiple Services (Saga)
```

This is the most classic event-driven microservice pipeline used by Coinbase, Stripe, Uber, DoorDash, etc.
