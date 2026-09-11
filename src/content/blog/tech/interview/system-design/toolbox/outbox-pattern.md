---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "event-driven", "tier1"]
title: "OutBox Pattern Toolbox"
weight: 11
---

## Interview Trigger

```
DB + Kafka / DB + MQ / Publish Event
Email / Notification / CDC / Event-driven / Microservices
```

---

## 为什么需要 Outbox？

最简单的代码：

```go
tx.Begin()
UpdateBalanceInDB()
tx.Commit()
kafka.Publish(event)  // ← 如果这里 Crash？
```

**Crash 场景一:** DB Commit 成功 → Crash → Kafka Publish 没执行 → Balance 已更新但 Notification/Reward 没收到。

**Crash 场景二:** Kafka Publish 成功 → Crash → DB Rollback → Kafka 已通知 "Transfer Success" 但数据库回滚了。

**根本原因:** MySQL 和 Kafka 不是同一个 Transaction，没有 Distributed Transaction。

---

## Outbox 怎么解决？

核心思想：**只 Transaction MySQL，Kafka 后面再发。**

```sql
CREATE TABLE outbox (
    id         BIGINT PRIMARY KEY,
    event_id   VARCHAR(64) UNIQUE,
    event_type VARCHAR(100),
    payload    JSON,
    status     ENUM('PENDING', 'SENT'),
    created_at TIMESTAMP
);
```

整个 Transaction：

```
BEGIN → Update Account → Insert Outbox Event → COMMIT
```

没有 Kafka。DB + Outbox 一起 Commit，保证一致。

---

## 谁负责发 Kafka？

Background Worker 不停扫 Outbox：

```
SELECT status=PENDING → Publish Kafka → UPDATE status=SENT
```

Crash 了也没关系 — Outbox 已经在 DB，Worker 重启继续扫。

---

## 整个流程

```
Client → Transfer Service
  → BEGIN
  → Update Account
  → Insert Outbox
  → COMMIT
  → Background Worker → Publish Kafka → Mark Sent
```

---

## Worker Crash 怎么办？

```
Publish Kafka → 💥 Crash → Mark Sent 没执行
→ Worker 重启 → 再次 Publish
```

所以 Outbox 天然是 **At Least Once**，Consumer 必须 **Idempotent**。

---

## 面试最喜欢的一句

> Outbox guarantees that the database update and event persistence happen atomically, while downstream consumers rely on idempotency because events may be delivered more than once.

---

## 为什么不用 2PC？

> Distributed transactions across MySQL and Kafka are complex, reduce availability, and hurt throughput. Most modern systems prefer eventual consistency with the Outbox Pattern.

---

## Follow-up

| Question | Answer |
| --- | --- |
| 为什么不直接发 Kafka？ | 不能保证 DB + Kafka 同时成功 |
| 为什么不是 Exactly Once？ | Worker 可能重复 Publish，Consumer 必须 Idempotent |
| 为什么不是 Redis？ | Redis 没有 transaction 机制，不能参与 MySQL transaction |

---

## 高频面试题

> How do you ensure that after a successful transfer, a notification event is never lost?

> I would use the Outbox Pattern. The transfer record and the outbox event are written in the same database transaction. A background publisher asynchronously publishes pending events to Kafka. Since publishing may be retried, downstream consumers should be idempotent.

---

## 事件驱动链

```
Transaction → Outbox → Kafka (At-Least-Once) → Idempotent Consumer
```

这是 Coinbase、Stripe、Uber 最经典的架构模式之一。
