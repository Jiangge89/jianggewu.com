---
date: 2026-08-11T00:00:00+08:00
tags: ["scalability", "tier2"]
title: "Consistent Hash Toolbox"
weight: 14
---

## 普通 Hash 的问题

4 个 Redis，算法 `hash(key) % 4`。

新增一个 Redis 变成 `% 5`，几乎所有 Key 都会移动 → **Massive Rehash**。

---

## Consistent Hash

不是 `% N`，而是一个 Hash Ring (0 ~ 2^32)。

每个 Redis 自己 Hash 到 Ring 上，User 也 Hash，然后**顺时针找到第一个 Node**。

```
Ring: 100(A) → 900(B) → 2000(C)
User1 hash → 1100 → 顺时针 → Redis C (2000)
```

---

## 增加一个 Node

新增 Redis E (hash=1500)，Ring 变成：

```
100(A) → 900(B) → 1500(E) → 2000(C)
```

只有 900~1500 这一段 Key 重新分配，其它全部不变。不用全部 Rehash。

因为不是 `hash % N`，而是 `Hash → Find Next Node`，Node 增加只改变附近一小段区间。

---

## Virtual Node

面试 Follow-up 100% 会问。

只有 3 个 Node，Hash 可能分布不均 → Load 不均衡。

解决：每个 Physical Node 对应 100 个 Virtual Node (A1, A2, ... A100)，散布整个 Ring → Load 平均。

---

## Trigger

```
Redis Cluster / Memcached / Distributed Cache / Distributed Storage
→ Consistent Hash
```

---

## 面试标准答案

> **Traditional hashing maps a key using `hash(key) % N`, so adding a node changes almost every mapping. Consistent hashing places both nodes and keys on a hash ring, so adding or removing a node only affects a small neighboring range of keys.**
