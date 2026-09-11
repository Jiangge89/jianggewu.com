---
date: 2026-08-11T00:00:00+08:00
tags: ["consistency", "tier1"]
title: "Isolation Level Toolbox"
weight: 7
---

## 误区

Transaction 只是定义了 BEGIN...COMMIT，**不同的 Isolation Level 决定了 Transaction 之间可以看到什么。**

## Interview Trigger

```
Concurrent Transaction / Dirty Read / Repeatable Read / Serializable
```

面试官更可能问 "What isolation level would you choose?" 而不是 "Define Phantom Read."

---

## 四种 Isolation Level

### 1. Read Uncommitted

几乎不用。允许读取别人还没 Commit 的数据 → Dirty Read。

### 2. Read Committed

Oracle / PostgreSQL 默认。**只能看到已经 Commit 的数据。**

### 3. Repeatable Read

MySQL InnoDB 默认。整个 Transaction 看到一致 Snapshot，后面别人 Commit 了新数据，我再次 Read 还是旧值。

### 4. Serializable

最严格。Transaction 几乎排队。性能最差，生产很少用。

---

## 面试需要记的

| Isolation | 什么时候想到 |
| --- | --- |
| Read Committed | 默认推荐（PostgreSQL/Oracle） |
| Repeatable Read | MySQL 默认 |
| Serializable | 极少使用，性能差 |

---

## Interview Follow-up

**Q1: What isolation level would you choose?**

> For most OLTP systems, I'd use the database default unless the business requires stronger guarantees. In MySQL that's typically Repeatable Read, while PostgreSQL defaults to Read Committed.

**Q2: Should I use Serializable?**

> Only if absolutely necessary. Serializable greatly reduces concurrency and throughput.

---

## 什么时候需要 Repeatable Read？

**场景 1: 生成报表** — 整个统计必须基于同一时刻的数据。

**场景 2: 金融结算** — 统计所有 Wallet 余额不能一半昨天、一半今天。

**场景 3: 复杂 Transaction** — Read → Business Logic → Read Again，希望两次 Read 一致。

---

## Wallet Transfer 呢？

很多 Transfer 不用 Repeatable Read，因为通常：

```sql
BEGIN;
SELECT ... FOR UPDATE;
UPDATE;
COMMIT;
```

或者 `UPDATE ... WHERE version = ?`，并发已经解决。

---

## 总结

|  | Dirty Read | Repeatable Read |
| --- | --- | --- |
| 看到未 Commit 数据 | ✅ | ❌ |
| 看到旧数据 | ❌ | ✅ (Snapshot) |
| 数据真实吗 | ❌ | ✅ (曾经 Commit 过) |

> **Repeatable Read 看到的是旧数据 (Snapshot)，不是脏数据 (Dirty Data)。**

Isolation level 是 transaction 的属性，可以全局配置或针对单个 transaction 设置：

```sql
-- MySQL
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN; ... COMMIT;

-- PostgreSQL
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
... COMMIT;
```

面试更常考的其实是 Optimistic Lock vs Serializable，或 SELECT FOR UPDATE vs Optimistic Lock。
