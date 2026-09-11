---
date: 2026-08-11T00:00:00+08:00
tags: ["storage", "tier2"]
title: "Object Storage Toolbox"
weight: 3
---

## Toolbox

```
Interview Trigger: Image / Video / PDF / Backup / Large File

Characteristics:
  Cheap / Durable / Massive Scale / Metadata / CDN Friendly

High-frequency Questions:
  Why not MySQL?  /  Why Pre-signed URL?  /  Why CDN?

Coinbase Scenarios: Avatar / Passport / Receipt / Statement PDF
```

## 特点

**Extremely Durable:** AWS S3 有 11 个 9 (99.999999999%)。

**Cheap:** 比 Redis/MySQL 便宜很多，适合 TB/PB 级别。

**Massive Scale:** 几乎无限。

**Metadata:** 每个 Object 可以存 Metadata，例如 `Content-Type: image/jpeg`。

---

## Interview Follow-up

**Q1: Why not store images in MySQL?**

> Large binary objects increase database size, slow down backups and replication, and make the database inefficient. I'd store only the object metadata or URL in MySQL.

**Q2: How do clients upload files?**

> I'd generate a pre-signed URL so the client uploads directly to object storage instead of routing large files through the application server.

**Q3: Why use CDN?**

热门头像下载 100 万次，不用每次访问 S3：

```
Client → CDN → S3
```

减少 Latency & 降低 Cost。
