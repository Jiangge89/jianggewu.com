---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "concurrency", "tier1"]
title: "Optimistic Lock Toolbox"
weight: 9
---

## Interview Trigger

看到这些关键词 → **Optimistic Lock**

```
Wallet / Inventory / Stock / Balance / Counter / Concurrent Update
```

---

## 怎么实现？Version Number

```sql
CREATE TABLE account (
    account_id VARCHAR(64) PRIMARY KEY,
    balance    BIGINT NOT NULL,
    version    INT NOT NULL
);
```

Request A 和 B 同时读取 `balance=100, version=5`：

```sql
-- Request A (先执行):
UPDATE account SET balance=20, version=version+1
WHERE account_id='A' AND version=5;
-- 1 row updated ✅, version → 6

-- Request B (后执行):
UPDATE account SET balance=50, version=version+1
WHERE account_id='A' AND version=5;
-- 0 rows updated ❌, 需要重试或返回 Conflict
```

---

## 为什么叫 Optimistic？

假设冲突很少发生：Read → Business Logic → Try Update → Conflict? → Retry

不会一开始就锁住数据。

---

## Optimistic vs Pessimistic

| | Optimistic | Pessimistic |
|---|---|---|
| 方式 | `WHERE version = ?` | `SELECT ... FOR UPDATE` |
| 假设 | 冲突少 | 冲突多 |
| Retry | 需要 | 一般不用 |

---

## Coinbase 场景

> I would use optimistic locking by adding a version column. During the update, I'd include the version in the WHERE clause. If no rows are updated, it means another transaction modified the record first, so the request should retry or return a conflict.

---

## 高频 Follow-up

**Q1: 为什么不用 Redis Lock？**

如果 Source of Truth 就在 MySQL，Optimistic Lock 直接利用数据库保证一致性，通常更简单。

**Q2: 什么时候不适合 Optimistic Lock？**

冲突很多时。例如热门库存 1 item left / 1000 users buy simultaneously → 不停 Retry 效率差 → Pessimistic Lock 或排队。

**Q3: Version 一定要有吗？**

不一定。也可以用 Atomic Conditional Update：

```sql
UPDATE account SET balance=balance-100
WHERE account_id='A' AND balance>=100;
```

这也是一种 Optimistic Concurrency Control，金融系统常见。

---

## 完整例子

```
Balance=100, Version=5
Withdraw 80 和 Withdraw 50 同时发生

Request A: UPDATE ... version=6 WHERE version=5 → 成功, Balance=20
Request B: UPDATE ... version=6 WHERE version=5 → 0 rows
  → Reload: Balance=20, 20 < 50 → Insufficient Balance
  → 不会出现 Balance=-30
```

---

## 最重要的一句话

很多候选人会说 "I will use a transaction"，这是不够的。Transaction 保证 Atomicity，**不能自动解决两个事务同时修改同一行的并发冲突。**

如果面试官问 "What if two users withdraw from the same account at the same time?"，第一反应应该是：

> **Optimistic Lock (or Pessimistic Lock, depending on contention)**
