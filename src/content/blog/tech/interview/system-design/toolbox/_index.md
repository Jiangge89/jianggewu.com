---
date: 2026-08-11T00:00:00+08:00
title: "System Design Toolbox"
weight: 1
---

# Part 1. Storage

## 1. Relational Database (Tier1)

<details>
<summary>Quick Reference</summary>

```
MySQL, PostgreSQL

What: 关系型数据库

When: Strong consistency / Transaction / Relationship / CRUD

Why: ACID / SQL / Index

Trade-off
  Pros: Strong consistency, Mature
  Cons: Hard to scale writes

Alternatives: Cassandra, MongoDB
```

</details>

Deep dive: [RDBMS Toolbox](/blog/tech/interview/system-design/toolbox/rdbms/)

---

## 2. Time-Series Database (Tier3)

```
InfluxDB, TimescaleDB, OpenTSDB, QuestDB

What: 专门存储时间序列数据 (asset, timestamp, value)

When: Monitoring / Metrics / Stock Prices / Sensor Data

Why:
- High write throughput, Append-only
- Time-range query
- Retention policy（比如只保留20天数据）
- Time partition

Alternatives: MySQL / PostgreSQL / Cassandra
```

---

## 3. Redis (Tier1)

<details>
<summary>Quick Reference</summary>

```
What: In-memory Key-Value Store

When: Cache / Session / Counter / Leaderboard / Latest Price

Why: Sub-ms latency, High QPS

Trade-off
  Pros: Fast
  Cons: Memory expensive

Alternatives: Memcached
```

</details>

Deep dive: [Redis 高频问题](/blog/tech/interview/system-design/toolbox/redis/)

---

## 4. Object Storage / S3 (Tier2)

<details>
<summary>Quick Reference</summary>

```
What: Store files instead of rows

When: Images / Videos / Backups / Logs

Why: Cheap / Scalable / Durable / Unlimited / CDN Friendly

Alternatives: Filesystem
```

</details>

Deep dive: [Object Storage Toolbox](/blog/tech/interview/system-design/toolbox/object-storage/)

---

## 5. Elasticsearch (Tier2)

<details>
<summary>Quick Reference</summary>

```
What: Full-text Search Engine

When: Search / Ranking / Log Search

Don't use: Primary DB
```

</details>

Deep dive: [Elasticsearch Toolbox](/blog/tech/interview/system-design/toolbox/elasticsearch/)

---

## 6. Cassandra (Tier3)

<details>
<summary>Quick Reference</summary>

```
What: Distributed Wide-column DB

When: Huge write / Huge scale / Eventually Consistent

Why: Horizontal Scaling

Don't use: Complex Join / Transaction
```

</details>

Deep dive: [Cassandra & MongoDB Toolbox](/blog/tech/interview/system-design/toolbox/cassandra-mongodb/)

---

# Part 2. Message Queue

## 1. Kafka (Tier1)

<details>
<summary>Quick Reference</summary>

```
                Kafka Cluster
                     │
      ┌──────────────┼──────────────┐
      │              │              │
  Broker1        Broker2        Broker3
      │              │              │
    P0,P3          P1,P4          P2,P5
```

```
What: Distributed Event Streaming Platform

When: Event / High throughput / Async / Replay

Why: High Throughput / Durable / Decouple

Why fast:
- Sequential Write / Append-only Log
- Partition
- Batch Send messages
- Zero Copy

Core Concepts:
  Topic / Producer / Broker / Partition
  Consumer Group / Consumer / Rebalance
  Offset / Replay

Partition Key:
  hash(key) % partitionCount -> decide which partition
  NOT Consistent Hash -> partition number not frequently change

Why Not RabbitMQ?
  RabbitMQ = Task
  Kafka = Event
```

</details>

Deep dive: [Kafka Top10 高频问题](/blog/tech/interview/system-design/toolbox/kafka/)

---

## 2. RabbitMQ (Tier3)

消费完消息之后消息会被自动删除，所以没有办法 replay。适合做 task queue 来使用。

为单 consumer 而设计，如果要实现 consumer group 的功能，需要借助多 topic 来实现。

```
What: Traditional Message Queue

When: Task Queue / Job Queue

Compared with Kafka: Less throughput / More routing
```

|  | Kafka | RabbitMQ |
| --- | --- | --- |
| Message 删除 | Retention 到期 | ACK 后立即删除 |
| Offset | ✅ | ❌ |
| Commit | ✅ | ❌ |
| ACK | Producer ACK、Consumer Commit | Consumer ACK |
| Replay | ✅ | ❌（已 ACK 的消息无法 Replay） |
| 默认语义 | At Least Once（Process → Commit） | At Least Once（Process → ACK） |

---

## 3. Messaging Pattern

```
Queue  - RabbitMQ
Pub/Sub - Kafka
```

---

# Part 3. Cache Pattern

## 1. Cache Aside

```
Application → Redis → DB
```

## 2. Write Through

```
Write → Cache → DB
两个都更新，higher latency，but better consistency.
```

## 3. Write Back

```
Write → Cache → DB Async
Fast, Risky
```

## 4. CDN (Tier2)

**When:** Static Files (Image / JS / CSS / Video), Global Access

---

# Part 4. Consistency

## 1. Transaction (Tier1)

Deep dive: [Isolation Level Toolbox](/blog/tech/interview/system-design/toolbox/isolation-level/)

## 2. Idempotency (Tier1)

Executing the same request multiple times has the **same effect** as executing it once.

Deep dive: [Idempotency Toolbox](/blog/tech/interview/system-design/toolbox/idempotency/)

## 3. Optimistic Lock (Tier1)

Optimistic Lock 解决的是"两个不同请求同时修改同一条数据"。

Deep dive: [Optimistic Lock Toolbox](/blog/tech/interview/system-design/toolbox/optimistic-lock/)

## 4. Pessimistic Lock (Tier1)

假设冲突一定会发生，或者会频繁发生，所以先加锁，再操作。

Deep dive: [Pessimistic Lock Toolbox](/blog/tech/interview/system-design/toolbox/pessimistic-lock/)

## 5. Distributed Lock (Tier1)

Redis / ZooKeeper — Prevent concurrent update

## 6. Outbox Pattern (Tier1)

```
DB → Outbox Table → MQ
```

Solve: DB updated, MQ failed

Deep dive: [OutBox Pattern Toolbox](/blog/tech/interview/system-design/toolbox/outbox-pattern/)

## 7. CDC (Tier2)

CDC = **Change Data Capture** = 捕获数据库里的数据变更，然后把这些变更作为事件流出去。

```
Read DB Log → MQ (No polling)
```

Deep dive: [CDC Toolbox](/blog/tech/interview/system-design/toolbox/cdc/)

## 8. Saga (Tier3)

Deep dive: [Saga Toolbox](/blog/tech/interview/system-design/toolbox/saga/)

---

# Part 5. Scalability

## 1. Sharding (Tier1)

Split Data By UserID / Region / Asset

**Trigger:** Data Too Large / Write Too Heavy

```
UserID % 4 → Shard1 / Shard2 / Shard3 / Shard4
```

**Tradeoff:** Cross-shard Query

## 2. Replication (Tier1)

```
Primary → Replica
```

Read Scaling. **Trigger:** Read Heavy

**Tradeoff:** Replication Lag

## 3. Load Balancer (Tier1)

Distribute Traffic. **Trigger:** High QPS / Multiple Servers

```
Users → LB → App1 / App2 / App3
```

## 4. Consistent Hashing (Tier2)

Reduce Re-sharding. **Trigger:** Cache / Distributed Storage

Deep dive: [Consistent Hash Toolbox](/blog/tech/interview/system-design/toolbox/consistent-hash/)

## 5. Rate Limiter (Tier2)

Protect System

## 6. Circuit Breaker (Tier2)

Prevent Cascading Failure

---

# Part 6. API

## 1. REST (Tier1)

Deep dive: [REST Toolbox](/blog/tech/interview/system-design/toolbox/rest/)

## 2. Pagination (Tier1)

Deep dive: [Pagination Toolbox](/blog/tech/interview/system-design/toolbox/pagination/)

## 3. WebSocket (Tier1)

Server Push / Realtime

Deep dive: [WebSocket Toolbox](/blog/tech/interview/system-design/toolbox/websocket/)

## 4. gRPC (Tier2)

**对外 API → REST** (Browser / Mobile / Language Agnostic)

**内部 Service → gRPC** (Binary Protobuf / HTTP/2 / Faster / Typed API / Streaming)

**Tradeoff:** Browser 支持差

> I would use REST for public APIs and gRPC for internal service-to-service communication.

## 5. SSE (Tier3)

Deep dive: [SSE Toolbox](/blog/tech/interview/system-design/toolbox/sse/)

---

# Part 7. Observability

> I'd monitor metrics, structured logs, and distributed tracing.

## 1. Metrics (Tier2)

```
QPS / Latency(P50/P95/P99) / Error Rate
Kafka Lag / Cache Hit Rate / DB QPS / CPU / Memory
```

## 2. Logging (Tier2)

Structured logging: TransferID / UserID / RequestID / Error

## 3. Tracing (Tier2)

Distributed tracing — TraceID 贯穿整个 Request

Tools: OpenTelemetry, Jaeger, Zipkin

## 4. Alerting (Tier2)

```
P99 > 100ms → Alert
Error Rate > 1% → PagerDuty
```

---

# Decision Tree

## Storage Decision Tree

```
Structured?       → YES → MySQL      / NO → Mongo
Key-Value?        → Redis
Search?           → Elasticsearch
Large File?       → S3
Timestamp?        → TSDB
Huge Write?       → Cassandra
```

## Messaging Decision Tree

```
Need async?
  Task?                          → RabbitMQ
  Event / Replay / Multi-downstream? → Kafka
```

|  | RabbitMQ | Kafka |
| --- | --- | --- |
| Message 默认删除 | ✅ ACK 后删除 | ❌ 保留到 Retention |
| Replay | ❌ | ✅ |
| 多个系统消费 | 多个 Queue | 多个 Consumer Group |
| Consumer Group | ❌ | ✅ |
| Scale Consumer | Worker 数量 | Partition 数量 |
| 最大并发 | Queue + Worker | Partition 数量 |

Kafka follow-up 围绕三个词: **Offset / Partition / Consumer Group**

RabbitMQ follow-up 围绕: **Exchange / Queue / Routing**

---

# Other

## Authentication

```
Who are you? → JWT / OAuth
```

## Authorization

```
Can you do it? → RBAC
```

## Encryption

```
TLS / HTTPS / AES
```
