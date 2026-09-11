---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "tier1"]
title: "Idempotency Toolbox"
weight: 8
---

## Interview Trigger

看到这些关键词第一反应 → **Idempotency**

```
Payment / Transfer / Webhook / Retry / Replay / Kafka / RabbitMQ
```

---

## 四种实现方法

### 方法一: Request ID / Business ID

通过 request id 避免同一个操作被执行多次。金融系统最常见。

天然有唯一 ID：transfer_id, payment_id, order_id, withdrawal_id。执行前先检查是否已有对应 id 的记录，如果已有，直接返回第一次结果。

### 方法二: Processed Events Table

特别适合 Kafka / RabbitMQ consumer：

```sql
CREATE TABLE processed_events (
    consumer_name VARCHAR(100) NOT NULL,
    event_id      VARCHAR(100) NOT NULL,
    processed_at  TIMESTAMP NOT NULL,
    PRIMARY KEY (consumer_name, event_id)
);

-- 放在同一个 DB transaction:
BEGIN;
INSERT INTO processed_events (consumer_name, event_id)
    VALUES ('reward-service', 'E123');
UPDATE user_points SET points = points + 100 WHERE user_id = 'U1';
COMMIT;
```

### 方法三: Unique Constraint

数据库强制幂等。Application-side check alone is not enough，数据库里用 unique constraint 作为最后一道防线：

```sql
CREATE UNIQUE INDEX uk_transfer_id ON transfers(transfer_id);
```

### 方法四: UPSERT

如果已经存在就安全地"不再创建"：

```sql
-- PostgreSQL
INSERT INTO processed_events (...) VALUES (...)
ON CONFLICT (consumer_name, event_id) DO NOTHING;

-- MySQL
INSERT IGNORE INTO processed_events(...) VALUES (...);
```

---

这四种方法很多时候是组合使用：

```
Business/Event ID → Unique Constraint → UPSERT
```

---

## 高频 Follow-up

**Q1: Why not rely on Kafka Exactly Once?**

> Because exactly-once delivery across Kafka, databases, and external services is difficult. I prefer at-least-once delivery combined with idempotent business logic.

**Q2: Where do you store the idempotency key?**

> Usually in the database together with the business record or in a dedicated processed-events table.

**Q3: Should Redis store it?**

可以，但 Redis 一般只是加速，真正 Source of Truth 还是 DB。
