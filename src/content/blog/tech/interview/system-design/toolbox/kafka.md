---
date: 2026-08-11T00:00:00+08:00
tags: ["message-queue", "tier1"]
title: "Kafka Top10 高频问题"
weight: 6
---

# Tier 1 (必须会)

## 1. Why Kafka? When should you choose Kafka?

面试官真正想问：为什么不用 RabbitMQ？

Kafka 适用于：Event-driven / High throughput / Multiple downstream consumers / Replay / Decoupling services

**Trigger:** Trade / Price Update / Order Event / Analytics / Audit

---

## 2. Partition

- **Why partition?** Horizontal scalability
- **How many partitions?** 看 consumer 数量和 producer throughput
- **How to choose partition key?** Preserve ordering for the same entity

例如 `Partition Key = Asset`，BTC 永远一个 Partition，保证顺序。**只保证同一个 Partition 内有序。**

---

## 3. Consumer Group

一个 Group 中：一条 Message 只消费一次。多个 Group：每个不同的 group 都消费一次。

---

## 4. Rebalance

什么时候发生：Consumer Join / Leave / Heartbeat Timeout / Partition Changed

为什么不好：Temporary pause / Latency spike

---

## 5. Offset

Kafka 最重要的概念。

```
Message → Offset
Consumer 记录 Offset
Replay: 修改 Offset
```

**Replay 怎么实现？** 新创建一个 consumer group 并指定初始 offset。

---

# Tier 2 (高频)

## 6. Why is Kafka fast?

四个原因：Append-only Log / Partition / Batch / Zero Copy

---

## 7. Ordering Guarantee

**同一个 Partition 内保证顺序，**跨 Partition 不保证。

如果 BTC 必须有序 → Partition Key 用 BTC。

---

## 8. Delivery Semantics

```
At Most Once  - 可能丢，但绝不重复 (poll → commit → process)
At Least Once - 不允许丢，但可能重复 (poll → process → commit)  ← 最常见
Exactly Once  - 最难实现
```

At Least Once + Idempotent Processing 是实际系统最常用的模式：

> I would use at-least-once delivery together with idempotent business logic. Every transfer would have a unique transfer ID. Before processing, I'd check whether that ID has already been processed. If it has, I'd skip it.

Kafka 可以为 Kafka-to-Kafka 提供 exactly-once (idempotent producer + Kafka transactions)，但 end-to-end exactly-once 还需要 database transaction、idempotency key、outbox 等机制。

---

# Tier 3 (了解即可)

## 9. Retention

Kafka Message 不删，有 Retention（例如 7 Days / 100 GB）。方便 Replay / Backfill / Audit。

---

## 10. Producer ACK

```
acks=0   → 不等 Broker (最快，可能丢)
acks=1   → Leader 收到就 ACK
acks=all → 所有 ISR 写成功才 ACK (金融交易推荐)
```

Trade-off: Latency VS Reliability

**Replication Factor** 决定每个 Partition 保存几份数据：

```
                Topic: Trade
           P0            P1             P2
Leader    Broker1       Broker2       Broker3
Follower  Broker2       Broker3       Broker1
Follower  Broker3       Broker1       Broker2
```

- Producer → Leader (简化 consistency 和 ordering)
- Follower 从 Leader 异步复制
- Leader 挂了 → 从 ISR (In-Sync Replicas) 中选新 Leader

---

# 高频 Follow-up

| # | Question | 重要度 |
|---|----------|--------|
| Q1 | Why Kafka instead of RabbitMQ? | ⭐⭐⭐⭐⭐ |
| Q2 | How do you preserve ordering? | ⭐⭐⭐⭐⭐ |
| Q3 | What if consumers are slower than producers? (Backpressure) | ⭐⭐⭐⭐ |
| Q4 | What happens if a consumer crashes? (Offset + Replay) | ⭐⭐⭐⭐⭐ |
| Q5 | How would you scale consumers? (Partition + Consumer Group) | ⭐⭐⭐⭐⭐ |
| Q6 | What causes rebalance? | ⭐⭐⭐⭐⭐ |
| Q7 | How would you replay yesterday's events? | ⭐⭐⭐⭐⭐ |

**Q8: Can Kafka guarantee global ordering?**

> No. Kafka only guarantees ordering within a partition. If global ordering is required, I would use a single partition, although that limits throughput.

**Q9: Why doesn't acks=all wait for every replica?**

> Because some replicas may be temporarily out of sync. Waiting for every replica would significantly reduce availability. Kafka only waits for the in-sync replicas (ISR), which provide a good balance between reliability and performance.
