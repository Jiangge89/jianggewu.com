---
date: 2026-08-11T00:00:00+08:00
tags: ["storage", "tier1"]
title: "RDBMS Toolbox"
weight: 1
---

## Interview Trigger

看到这些词，脑子立即想到 MySQL/PostgreSQL：

```
Account / Wallet / Order / Transaction / Inventory
Payment / User / Relationship / ACID / Strong Consistency
```

## Q1: 为什么选择 RDBMS？

> Because the data is highly structured, requires strong consistency, and involves transactions across multiple related records.

```
A Atomicity - 要么全部成功，要么全部失败
C Consistency - 保证数据库约束不会被破坏，比如 balance 不能为负
I Isolation
D Durability - Commit 之后数据不会丢
```

## Q2: 什么时候不用 MySQL？

```
全文搜索 → Elasticsearch
Hot Key  → Redis
巨量 event → Kafka
Object   → S3
TS Data  → TSDB
```

---

## Core Concept 1: Index

这是 MySQL 面试第一高频。

假设 1000 万 User 没有 Index：

```sql
SELECT * FROM user WHERE email='abc@gmail.com'
-- Full Scan → O(n)
```

有 Index → O(log n)，底层是 B+Tree。

**面试 Trigger:** 看到 `Query Slow` → 第一反应：Index。

---

## Core Concept 2: Composite Index

```sql
SELECT * FROM trade WHERE user_id = ? AND created_at > ?
```

不要两个单独 Index，而是：`(user_id, created_at)` Composite Index。

### Left-most Prefix Rule

Index: `(user_id, created_at)`

```
WHERE user_id = ?                       ✅
WHERE user_id = ? AND created_at > ?    ✅
WHERE created_at > ?                    ❌ 不能利用 Index
```

---

## Core Concept 3: Primary Key

| 场景 | 推荐 |
| --- | --- |
| 单库 MySQL | Auto Increment |
| 分布式系统 | Snowflake / UUIDv7 |
| UUID v4 | 不推荐做 Clustered Primary Key |

UUID v4 作为 Primary Key 会导致 Page Split、数据移动、更多 Disk IO。Snowflake 或 UUID v7 既全局唯一，又近似递增。

---

## Core Concept 4: Transaction

Transfer 必须 A-100 和 B+100 一起成功或一起失败 → Transaction。

---

## Core Concept 5: Read Replica

```
100k Read / 100 Write → Primary + Replica1 + Replica2 + Replica3
Write: Primary    Read: Replica
```

**Follow-up:** Replication Lag → 最终一致。

---

## Core Concept 6: Sharding

100 TB 一个 MySQL 放不下：

```
UserID % 4 → DB1 / DB2 / DB3 / DB4
```

**Follow-up:** Cross-shard Query。

---

## Core Concept 7: Index 底层实现 (B+Tree)

**Why B+Tree?**

- Balanced tree → O(logN) lookup
- Internal Node 只有 Key & Child Pointers，Leaf 才有数据 → 树更矮（1000 万记录通常 3-4 层）
- Leaf 之间有 Next Pointer → Range Query 特别快
- 一个 Node = 一个 Page → 一次 Disk IO 读整个 Page

**Why not Red Black Tree?** RBTree 一个 Node 一个 Key，树太高，Disk IO 多。

```
B+Tree

Characteristics:
  O(logN) lookup / Data only in leaf nodes
  Leaf nodes linked / High branching factor
  Optimized for disk I/O

Interview Questions:
  Why B+Tree instead of Hash?
  Why is range query fast?
  Why only leaf nodes store data?
```

---

## 高频 Follow-up

| Question | Answer |
| --- | --- |
| Why MySQL instead of Redis? | Redis 不是 Source of Truth |
| Why not MongoDB? | Schema 固定，需要 Transaction |
| Why not Cassandra? | 需要 Strong Consistency |
| How to make queries fast? | Index |
| Read QPS 太高？ | Read Replica / Redis |
| Write 太高？ | Partition / Sharding |

## RDBMS Decision Tree

```
Need ACID?    → MySQL
Read Heavy?   → Read Replica + Redis
Write Heavy?  → Partition / Sharding
Slow Query?   → Index
```
