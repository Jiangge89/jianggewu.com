---
title: "All-in-One Page"
weight: 1
---

# System Design All-in-One Mental Map

> Follow these 12 steps during the interview to cover every module. Each step maps to specific technology choices and tradeoffs.

## Decision Mainline

``` text
1. Who is the client?
        ↓
2. How do they communicate?
        ↓
3. How does traffic enter the system?
        ↓
4. What does the API/service do?
        ↓
5. Sync or Async communication?
        ↓
6. Where does data live?
        ↓
7. Do we need cache?
        ↓
8. Do we generate events?
        ↓
9. Do we integrate external systems?
        ↓
10. What happens when something fails?
        ↓
11. How do we scale?
        ↓
12. How do we observe it?
```

---

## 1. Client Types

``` text
App (iOS / Android)
Web (Browser)
Server (internal service / third-party)
```

## 2. Communication Protocols

| Protocol | Use Case | Direction |
|---|---|---|
| **HTTP (REST)** | Standard request-response | Client ↔ Server |
| **gRPC** | Internal service RPC, Protobuf + HTTP/2 | Service ↔ Service |
| **WebSocket** | Bidirectional persistent connection: chat, trading, gaming | Bidirectional |
| **SSE** | Server → Client one-way push: notifications, price updates | One-way |
| **Webhook** | Async Server → Server callback | One-way |

### gRPC Tradeoff

Strong schema / high performance / HTTP/2 multiplexing. But poor browser support, harder to debug than JSON REST, higher tooling complexity.

## 3. Traffic Entry: Load Balancer

Requests pass through LB (commonly Nginx), distributed evenly to target services.

### LB Algorithms

| Algorithm | Description |
|---|---|
| Random | Random distribution |
| Round Robin | Sequential rotation |
| Weighted Round Robin | Rotation by weight |
| Least Connections | Pick server with fewest connections |
| Consistent Hashing | Route by key hash (stateful scenarios) |

### L4 vs L7

| | L4 (Transport) | L7 (Application) |
|---|---|---|
| Based on | IP / Port / TCP | HTTP path / header / cookie |
| Advantage | Fast, simple | Smart routing, canary, rate limiting |

## 4. API Layer (Cross-Cutting Concerns)

``` text
├── Generate request_id / trace_id
├── Authentication & Authorization
├── Request-level logging & end-to-end metrics
├── Default timeout & rate limiting
├── Request validation & size limit
├── Routing
├── CORS
└── API versioning
```

## 5. Inter-Service Communication: Sync vs Async

### Sync: gRPC

Used when you need an **immediate result**.

### Async: Pub/Sub (Message Queue)

Used for **decoupling**, especially when the publisher receives continuous messages or has burst traffic the subscriber cannot handle.

### Message Queue Selection

| Type | Best for |
|---|---|
| **In-Memory Queue** | Lightweight, single process |
| **Redis** | Lightweight distributed |
| **RabbitMQ** | Task distribution, routing, work distribution, flexible ACK |
| **Kafka** | High-throughput event streaming, event log, replay, multiple consumer groups, ordered within partition |

### Pub/Sub Observability & Backpressure

Key metrics to monitor:

``` text
Producer rate
Consumer rate / lag / throughput
Queue depth / Oldest message age
```

Solutions when consumer lag is too high:

``` text
Scale consumers (if possible)
Batch consumption (if possible)
Slow producer (backpressure)
Reject low-priority work / load shedding (degradation)
```

### Rate Limiter

Controls publisher speed, applies backpressure to upstream.

Common algorithms:

``` text
Fixed Window
Sliding Window
Sliding Window Counter (approximation)
Token Bucket
Leaky Bucket
```

Single-machine vs distributed (Redis atomic / Lua script).

## 6. Data Storage

### DB Selection

| Type | Best for | Examples |
|---|---|---|
| **RDBMS** | Profile, Payment, strong consistency | MySQL / PostgreSQL |
| **TSDB** | Append-only writes, time series | InfluxDB / TimescaleDB |
| **Document DB** | Flexible schema | MongoDB |
| **Search Engine** | Full-text search (not MySQL LIKE) | Elasticsearch |
| **Wide-Column** | Massive writes | Cassandra |

### RDBMS Core Knowledge

| Concept | Key Points |
|---|---|
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **Isolation Levels** | Read Uncommitted → Read Committed → Repeatable Read → Serializable |
| **Index** | B+ tree: data in leaf nodes, efficient range queries |
| **Locking** | Pessimistic (high contention) vs Optimistic (low contention) |

### Write DB + Generate Event: Outbox + CDC

Prevents the problem where DB write succeeds but event publishing fails.

``` text
DB Transaction
├── Write business data
└── Write outbox table (same transaction)

CDC (Change Data Capture)
└── Monitor binlog / outbox table → Publish to Kafka
```

- **Outbox**: Write DB + write outbox table in the same transaction, ensuring reliable persistence
- **CDC**: Monitor transaction log / binlog, read events from outbox table and publish to Kafka
- The two are complementary. Can also skip CDC and use polling on the outbox table instead

### Pagination

| Type | Description | Issues |
|---|---|---|
| **Offset** | `LIMIT 10 OFFSET 100` | Slow at large offsets, concurrent insert/delete causes duplicate/missing items |
| **Keyset** | Based on the last item's key from previous page | Needs a tie-breaker key for stable sorting |
| **Cursor/Token** | Hash the keyset (HMAC-SHA256 to prevent tampering) | Cannot jump to arbitrary pages |

### Static Files

``` text
Static files → Object Storage (S3)
             → CDN cache
             → HTML references CDN URLs
```

## 7. Cache

### Selection

| Type | Advantage | Disadvantage |
|---|---|---|
| **In-Memory** | Extremely fast, no network overhead | Hard to invalidate (can use Kafka broadcast) |
| **Redis** | Distributed, Cache-Aside pattern | Network overhead |

### Common Cache Problems

| Term | Scenario | Solution |
|---|---|---|
| **Penetration** | Query for non-existent data — not in cache, not in DB | Cache NotFound, Bloom Filter |
| **Breakdown** | One hot key expires, massive requests hit DB | SingleFlight, Lock, Logical Expiration |
| **Avalanche** | Many keys expire simultaneously | TTL Jitter, staggered warm-up |

**Mnemonic:**

``` text
Penetration = NONE exists
Breakdown   = ONE hot key
Avalanche   = MANY keys
```

### Other Cache Considerations

- **Staleness / Freshness**: Define acceptable data delay
- **Data Consistency**: Cache must not be the source of truth
- **Bloom Filter** (Redis implementation): Bitmap to filter out non-existent IDs, avoiding invalid queries

## 8. External Service Integration

### Adapter Layer

Dedicated layer to handle external service API / signature / request / response, plus data field and format conversion.

### Ingestion Service

When receiving data from external sources:

``` text
├── Data normalization
├── Invalid data cleanup
├── Aggregation
└── Freshness check
```

### Communication Methods

HTTP / WebSocket / Kafka are the three common choices.

### How to protect yourself when downstream services fail?

``` text
Health Check (heartbeat + health API)
Retry + Exponential Backoff + Jitter
Timeout
Circuit Breaker (fail fast, avoid cascading failure)
Bulkhead (isolate connection pools, external hang does not affect other services)
Fallback
Idempotency
DLQ (Dead Letter Queue)
Reconciliation
Decouple: use Kafka to decouple upstream and downstream
```

## 9. File Upload

``` text
Client → API → Generate pre-signed URL (short-lived)
Client → Direct upload to Object Storage (bypass server)
```

## 10. Background & Reconciliation

Background reconciliation service to handle corner cases (e.g. stuck approval failures).

---

## Reliability Patterns

> **How does my system fail safely?**

All reliability patterns consolidated:

| Pattern | Purpose |
|---|---|
| **Timeout** | Prevent infinite waiting |
| **Retry** | Retry transient errors |
| **Exponential Backoff** | Avoid retry storms |
| **Jitter** | Spread out retry timing |
| **Circuit Breaker** | Fail fast, prevent cascading failures |
| **Bulkhead** | Isolate failure domains |
| **Rate Limiter** | Protect services from being overwhelmed |
| **Load Shedding** | Proactively drop low-priority requests |
| **Fallback** | Degraded alternative |
| **Idempotency** | Ensure retries are safe |
| **DLQ** | Handle failed messages |
| **Reconciliation** | Post-hoc audit and repair |

---

## Idempotency

> **Retry is only safe when the operation is idempotent.**

``` text
Client
   ↓ request_id
API
   ↓
Idempotency Store (check if already processed)
```

Use cases:

``` text
Payment
Order creation
Notification
MQ consumer
Webhook
Inventory deduction
```

---

## Flash Sale

``` text
Normal traffic          Flash Sale
      ↓                       ↓
   5k QPS               500k QPS
```

Core challenge: **How to absorb instant burst while protecting DB.**

### Typical Architecture

``` text
Client
  ↓
CDN / Gateway
  ↓
Rate Limiter
  ↓
Eligibility Check
  ↓
Redis Atomic Stock Reservation (Lua script for atomicity)
  ↓
MQ (peak shaving)
  ↓
Order Worker
  ↓
DB
```

Connected knowledge points:

``` text
Rate Limiter → throttling
Redis Lua → atomic inventory deduction
Idempotency → prevent duplicate orders
MQ buffering → peak shaving
Backpressure → control producer speed
Async order creation → asynchronous ordering
DLQ → failed order handling
Compensation / Reconciliation → auditing
```

---

## Special Workload Quick Reference

### Read-heavy

``` text
CDN
Cache
Read Replica
Denormalization
```

### Write-heavy

``` text
Partition / Sharding
Batch writes
Async processing
Kafka
Cassandra / suitable storage
```

### Real-time

``` text
WebSocket / SSE
Kafka
Stream Processing
Redis Pub/Sub
```

### Large Fan-out

``` text
Feed (Timeline)
Notification
Celebrity problem
Fan-out on read vs Fan-out on write
```

### Large File

``` text
Object Storage
Pre-signed URL
Multipart upload
CDN
```

### Strong Consistency

``` text
DB Transaction
Pessimistic / Optimistic Lock
Version control
Idempotency
```

### Burst Traffic

``` text
Rate Limiter
Queue buffering
Load Shedding
Autoscaling
Backpressure
```
