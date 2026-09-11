---
date: 2026-08-11T00:00:00+08:00
tags: ["storage", "search", "tier2"]
title: "Elasticsearch Toolbox"
weight: 4
---

## Interview Trigger

看到这些需求，第一反应是 Elasticsearch：

```
Search / Keyword Search / Full-text Search
Autocomplete / Fuzzy Search / Ranking / Filter + Search
```

## What

> **A distributed search engine built on an inverted index.**

关键词：Distributed / Full-text Search / Inverted Index

---

## 为什么快？

### 1. Inverted Index

最重要的原因。不是 document → terms，而是 term → documents。

### 2. Tokenization

```
"Bitcoin is amazing" → [Bitcoin, is, amazing] → 建立 Index
```

### 3. Distributed

Index 可以 Sharding：`Shard1 / Shard2 / Shard3`，多个 Node 一起 Search。

---

## 支持的搜索类型

- **Full-text Search:** `bitcoin wallet`
- **Prefix Search:** 输入 `bit` → 找到 Bitcoin
- **Fuzzy Search:** 输入 `bitcon`（少一个 i）→ 仍然找到 Bitcoin
- **Ranking:** 按 Relevance 排序，不是 Primary Key

---

## 高频 Follow-up

**Q1: Why Elasticsearch instead of MySQL?**

> Elasticsearch is optimized for full-text search using inverted indexes, while MySQL indexes are designed primarily for exact lookups and range queries.

**Q2: What is an inverted index?**

> Instead of mapping a document ID to its content, an inverted index maps each term to the list of documents containing that term, allowing very fast keyword searches.

**Q3: Should Elasticsearch be the source of truth?**

> No. I'd use MySQL as the source of truth and keep Elasticsearch synchronized asynchronously through CDC or Kafka.

**Q4: When would you NOT use Elasticsearch?**

Transfer / Wallet / Payment — 这些需要 Transaction 和 Strong Consistency，还是 MySQL。
