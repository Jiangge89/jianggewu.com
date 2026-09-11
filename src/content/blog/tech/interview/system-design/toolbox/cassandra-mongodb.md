---
date: 2026-08-11T00:00:00+08:00
tags: ["storage", "nosql", "tier3"]
title: "Cassandra & MongoDB Toolbox"
weight: 5
---

# Cassandra

## Interview Trigger

看到这些关键词想到 Cassandra：

```
Huge Write Throughput / Time-series / Distributed
Eventually Consistent / Petabytes / Multi-region
```

## What

> **A distributed wide-column NoSQL database optimized for high write throughput and horizontal scalability.**

## 为什么不用 MySQL？

假设每天 10 Billion Events (IoT, Log, Telemetry, Sensor)。MySQL 写压力越来越大。Cassandra 天然 Horizontal Scaling，增加 Node 继续写。

## 缺点

没有复杂 JOIN，没有强事务。通常 Eventually Consistent。

## Coinbase 场景

```
✅ User Activity Log / Price Tick / Metrics / Audit Log
❌ Wallet / Transfer / Payment
```

> Use Cassandra when write scalability is more important than strong consistency.

---

# MongoDB

## Interview Trigger

```
Flexible Schema / JSON / Rapid Development / Nested Document
```

## 为什么不用 MySQL？

每个 Product 字段完全不同（Phone: cpu/ram/camera, Book: author/publisher），Schema 一直变化，Mongo 方便。

## 缺点

复杂 Transaction。关系查询没有 MySQL 成熟。

## Coinbase 场景

```
可能: User Preference / Configuration / Feature Flag
不是: Transfer / Wallet
```

---

# 四种 Database 对比

| Database | 最适合 | 不适合 |
| --- | --- | --- |
| MySQL | Transaction、Relationship | Full-text Search、Huge Write |
| MongoDB | Flexible Schema | Strong Relational Data |
| Cassandra | Massive Writes、Horizontal Scale | Transaction |
| TSDB | Time Series | General OLTP |

---

# Storage Decision Tree

```
Need Transaction / ACID?            → MySQL
Need Cache / Hot Data / Low Latency? → Redis
Need Event Streaming / Replay?       → Kafka
Need Large Files?                    → Object Storage
Need Full-text Search?               → Elasticsearch
Need Massive Writes?                 → Cassandra
Need Flexible JSON Schema?           → MongoDB
Need Time-series Data?               → TSDB
```
