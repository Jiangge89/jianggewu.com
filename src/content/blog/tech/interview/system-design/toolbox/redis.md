---
date: 2026-08-11T00:00:00+08:00
tags: ["storage", "cache", "tier1"]
title: "Redis 高频问题"
weight: 2
---

## Top 10 高频问题

1. Why Redis?
2. Cache Aside ⭐⭐⭐⭐⭐
3. Cache Penetration ⭐⭐⭐⭐⭐
4. Cache Breakdown ⭐⭐⭐⭐⭐
5. Cache Avalanche ⭐⭐⭐⭐
6. Distributed Lock ⭐⭐⭐⭐
7. Rate Limiter ⭐⭐⭐⭐
8. Persistence (RDB/AOF) ⭐⭐⭐
9. Cluster ⭐⭐⭐
10. Pub/Sub / Streams ⭐⭐

## 场景联想

| Trigger | Redis? |
| --- | --- |
| Low Latency | ✅ |
| Hot Data | ✅ |
| 100k QPS | ✅ |
| Latest State | ✅ |
| Session | ✅ |
| Leaderboard | ✅ |
| Counter | ✅ |
| Rate Limiter | ✅ |

**Why not Redis?** Redis 一般不是 Source of Truth。

---

## Cache Aside Pattern

最经典的 Cache Pattern。

**Read:**
```
Client → Redis → Hit? → Yes → Return
                      → No  → MySQL → Write Redis → Return
```

**Write:**
```
Update User → MySQL → Delete Redis
```

TTL 设置过期时间，实现数据最终一致性。

---

## 必问三兄弟

**Cache Penetration 击穿:** cache 里没有而且也不会缓存，比如 404 的 product。解决：Cache NULL 或 Bloom Filter。

**Cache Breakdown 崩溃:** 热点 key 的 TTL 刚过，100k 请求同时打 DB。解决：Single Flight / Mutex / Never Expire / Refresh Ahead。

**Cache Avalanche 雪崩:** 100 万 key 的 TTL 同一时间过期，请求全部打 DB。解决：Random TTL / Warm Cache / 多级 Cache (CDN-Redis-DB)。

---

## Redis 分布式锁

核心思想：大家竞争创建同一个 key，只有一个客户端能成功。

```
SET lock:account:123 <unique-token> NX PX 10000
```

- `NX`: key 不存在才写入
- `PX 10000`: 10 秒自动过期，防止持锁进程挂了永远不释放
- `<unique-token>`: 每次加锁唯一生成的 UUID

```
A → SET NX → OK      (获得锁)
B → SET NX → failed
C → SET NX → failed
```

释放锁时不能直接 `DEL`，因为可能删掉别人的锁。必须用 Lua 做原子 compare-and-delete：

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
end
return 0
```

> **SET NX + TTL + unique token + atomic check-and-delete.**

金融交易核心余额正确性不会只依靠 Redis distributed lock。Source-of-truth 层通常还会使用 DB transaction、row lock、optimistic locking。Redis lock 更适合跨实例协调。

---

## Redis Rate Limiter

### Fixed Window Counter

```
key: rate:user123:202608101705
每请求 INCR key，第一次 EXPIRE key 60
count > 100 → Reject
```

优点：简单、O(1)。问题：window boundary burst（边界处可能过 2x 流量）。

### Sliding Window

用 Sorted Set，score = timestamp，member = requestID。

```
ZREMRANGEBYSCORE  - 清理窗口外数据
ZCARD             - 统计过去 60 秒数量
ZADD              - 插入
```

优点：更准确。缺点：Memory 和计算成本更高。

### Token Bucket

```
capacity = 100 tokens, refill = 10 tokens/s
tokens >= 1 → allow
tokens < 1  → reject
```

> 允许一定程度 burst，同时控制长期平均速率。

**快速决策：**
- 简单限制 → Fixed Window
- 精确 rolling window → Sliding Window
- 允许 burst → Token Bucket

---

## 面试高频问题

**Q1: Why delete instead of update?**

> Deleting the cache is simpler and avoids cache inconsistency. With cache invalidation, the next read naturally reloads fresh data from the database.

**Q2: Why Cache Aside?**

简单，数据库仍然是 Source of Truth。

**Q3: BTC price cache TTL 30s，每 30 秒观察到 DB 流量暴涨？**

> **Cache Breakdown (Hot Key Expiration)** — I'd use a single-flight mechanism or a distributed lock so that only one request reloads the value.
