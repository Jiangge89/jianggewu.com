---
date: 2026-08-11T00:00:00+08:00
tags: ["api", "tier1"]
title: "Pagination Toolbox"
weight: 16
---

## Interview Trigger

```
Feed / Posts / Transactions / History / Orders / Search / 100M rows
→ Pagination
```

---

## 为什么不能直接 LIMIT 20？

```sql
SELECT * FROM transaction LIMIT 20 OFFSET 1000000;
-- 数据库还是要 Scan → Skip 1000000 rows → Return 20
-- Offset 越大越慢
```

---

## 两种 Pagination

### 1. Offset Pagination

```sql
LIMIT 20 OFFSET 40
```

优点：简单，可以跳到第 N 页。

缺点：Offset 大会变慢；新数据插入后容易重复/遗漏。

### 2. Cursor Pagination (推荐)

```sql
SELECT * FROM transaction
WHERE id < last_seen_id
ORDER BY id DESC
LIMIT 20;
```

不会重复，效率 O(logN + limit)。

---

## Cursor 可以是什么？

```
ID / Timestamp / (created_at, id)
```

金融通常用 `created_at + id`，因为 Timestamp 可能一样。

---

## Interview Follow-up

**什么时候不用 Offset?**

```
Large Dataset / Feed / Timeline / History → Cursor
```

**什么时候 Offset 可以?**

```
Admin 后台 / 1000 rows → 完全没问题
```
