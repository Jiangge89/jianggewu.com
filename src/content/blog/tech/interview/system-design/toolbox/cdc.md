---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "event-driven", "tier2"]
title: "CDC Toolbox"
weight: 12
---

## CDC 是什么

> **CDC (Change Data Capture) captures committed database changes and propagates them to downstream systems.**

例如 MySQL 里 `UPDATE account SET balance = 80`，CDC 从 binlog 捕获 change，转成事件发到 Kafka。

---

## 为什么需要 CDC

Outbox 的标准实现用 Background Worker poll outbox table → publish Kafka，但有成本：

- 不停 poll outbox table
- 维护 PENDING / SENT 状态
- 额外查询和 update
- worker 处理并发、retry

CDC 替代方案：

```
DB Transaction → Business Table + Outbox Table → COMMIT
→ CDC reads DB change log → Kafka
```

这就是 **Outbox + CDC**。

---

## CDC 从哪里读？

不是 `SELECT * FROM table`，而是读数据库自己的 change log：

```
MySQL: binlog    →  Debezium  →  Kafka
PostgreSQL: WAL  →  Debezium  →  Kafka
```

---

## 为什么比 Polling 好？

Polling 即使没事件还是每秒查一次。CDC 有 change 立即捕获，更接近 event-driven，延迟更低。

---

## CDC 一定要配 Outbox 吗？

不一定。例如：`user table → CDC → Elasticsearch` 或 `orders → CDC → Data Warehouse`，直接 CDC 无需 Outbox。

---

## 为什么还需要 Outbox？

因为 **Database change != Business Event**。

`UPDATE transfer SET status='COMPLETED'` 技术上只是一行变了，但业务上想发布的是 `TransferCompleted` (含 event_id, transfer_id, user_id, amount 等)。

更干净的设计：

```
Business Logic → Transaction
  ├── Update transfer
  └── Insert outbox_event
→ CDC watches outbox → Kafka
```

> Application 决定"什么是业务事件"，CDC 负责可靠地把它搬到 Kafka。

---

## CDC vs Outbox

不是竞争关系：

- **Outbox:** 解决"业务数据 + event record 如何原子写入"
- **CDC:** 解决"event record 如何可靠地从 DB 搬到 Kafka"

组合使用：`Transaction → Business Table + Outbox Table → CDC → Kafka`

---

## CDC 是 Streaming

Debezium 建立长连接，维护 binlog file + offset，数据库一写就立刻 Read → Parse → Publish Kafka。

> CDC is a **streaming read** rather than **polling**. It maintains a **long-lived connection** and continuously consumes **append-only database logs**, instead of repeatedly querying tables with SQL.

---

## 高频面试问题

**Q: Why use CDC instead of polling the outbox table?**

> CDC reads the database change log directly, so it avoids continuously polling the outbox table and can provide lower-latency, more scalable event propagation.

**Q: Why not CDC the business tables directly?**

> Because database changes don't always map cleanly to business events. I prefer writing explicit domain events into an outbox table and using CDC to publish those events.

---

## Toolbox

```
CDC

What: Capture database changes from transaction logs
Common Sources: MySQL binlog / PostgreSQL WAL
Typical Tool: Debezium

Use Cases:
  Outbox → Kafka
  DB → Elasticsearch
  DB → Data Warehouse

Why: No polling / Low latency / Reliable change stream

Trade-off:
  More infrastructure / Schema evolution
  Event ordering / replay complexity
```
