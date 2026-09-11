---
date: 2026-07-22T20:00:00+08:00
tags: ["AI", "投资框架", "价值链", "Infrastructure", "Workflow", "Physical AI"]
title: "AI 投资框架：从算力到真实业务价值"
weight: 0
---

## 前言

今天重新梳理了自己对 AI 投资的理解。我关注的重点已经不再是「哪个公司用了 AI」，而是：

> **AI 的价值最终会沉淀到哪里？**

## AI 价值链

``` text
Compute（算力）
        ↓
Infrastructure（基础设施）
        ↓
Observability & Security（监控与安全）── 贯穿所有层的基础能力
        ↓
Enterprise Data（企业数据）
        ↓
Workflow（业务流程）
        ↓
Physical AI（机器人执行）
```

每一层都在为下一层创造条件。但价值链不是单向的 — **越靠近客户业务的层，护城河越深，越难被替代。**

### Compute

芯片设计和制造，AI 算力的源头。

代表：NVIDIA、AMD。

制造：TSMC。

设计工具（EDA）：Cadence（CDNS）、Synopsys（SNPS） — 芯片复杂度越高，EDA 工具越不可替代。

### Infrastructure

把算力交付给用户的中间层。子赛道包括：

- **定制芯片 + 网络**：Broadcom（Google TPU / Meta MTIA 的 ASIC 设计方 + AI networking）
- **光模块**：AAOI（数据中心高速光互联，垂直整合制造）
- **PCB / 基板**：TTM Technologies（AI 服务器高复杂度互联方案）
- **散热 / 电力**：Vertiv（数据中心电力和散热基础设施）
- **AI 云平台**：Nebius（GPU 集群 + 云平台，NVIDIA 战略联盟）、Microsoft Azure、AWS

目前市场仍然主要围绕 AI 基建展开，科技巨头持续投入资本支出（CapEx）。TSMC 2026 年 capex 上调至 $60-64B。

### Observability & Security

**这一层不是可选的 Workflow 工具，而是每个 AI 应用都必须具备的基础能力。** 就像软件有很多种，但每个软件都需要监控和安全 — 它们是 common feature，不是 optional feature。

- **可观测性**：Datadog（DDOG） — AI 应用越复杂，监控需求越大
- **网络安全**：Palo Alto Networks（PANW）、Zscaler（ZS）、CrowdStrike（CRWD） — AI 扩大了攻击面，安全需求只增不减

这一层的特点是：**无论 AI 行业怎么发展，无论哪个 Workflow 胜出，监控和安全都不会被省掉。**

### Enterprise Data

企业数据治理、权限管理和数据整合，是 AI 真正落地的基础。没有干净的数据，再好的模型也无法产出可靠结果。

代表：Palantir、Snowflake、Databricks（未上市）。

### Workflow

AI 更像 Workflow 中的新员工，而不是 Workflow 的替代者。真正的价值在于把 AI 嵌入到企业已有的业务流程中，让人和 AI 协同工作。

代表：ServiceNow、Salesforce、SAP、GitLab、Veeva。

### Physical AI

把 AI 从数字世界延伸到物理世界。AI 不再只是理解和决策，而是开始执行现实世界的任务。

包括人形机器人、工业机器人、医疗机器人、自动驾驶、无人仓储。

代表：Tesla（Optimus）、Intuitive Surgical（达芬奇手术机器人）。

## 三个阶段是叠加，不是接力

一个重要的认知：**Wave 1 不会在 Wave 2 开始时结束。** 三个阶段是叠加关系 — Physical AI 时代反而需要更多算力（机器人实时推理需要本地 + 云端 GPU），Wave 1 的生命周期可能比想象的更长。

这意味着 Infrastructure 层的龙头（NVDA、AVGO、TSM）可能值得比"阶段性持有"更长的周期。

``` text
Wave 1: Infrastructure     ████████████████████████████████████
Wave 2: Data + Workflow          ████████████████████████████
Wave 3: Physical AI                       █████████████████████████
```

### 第一阶段（现在）

AI Infrastructure — GPU、Networking、PCB、Power、Cooling。

### 第二阶段（未来 2~5 年）

Enterprise Data + Workflow — GPU 买完了，AI 部署好了，接下来怎么赚钱？

重点关注：
- Palantir
- ServiceNow
- Salesforce
- Snowflake

### 第三阶段（未来 5~10 年）

Physical AI：

- 人形机器人
- 工业机器人
- 医疗机器人
- 自动驾驶

## 为什么 AI 基建会逐渐 Commodity（商品化）

Commodity 并不是没有价值，而是：

- 越来越便宜
- 越来越普及
- 客户更关注价格、性能和服务

电脑、云计算、电力的发展都经历了类似过程。

未来企业竞争的不再是谁拥有 AI，而是谁能利用 AI 创造利润。

**但 commodity 化有一个最大的阻力：软件生态锁定。** NVIDIA 的 CUDA 生态就是例子 — 即使硬件性能趋同，开发者和企业已经在 CUDA 上积累了大量代码、工具和经验，迁移成本极高。这就是为什么 AMD 性价比更高，但 NVDA 仍然能维持溢价。硬件可以 commodity，但生态不容易。

## 真正的护城河

未来真正难以复制的是：

- 行业知识（Domain Knowledge）
- 企业数据（Enterprise Data）
- Workflow（业务流程）
- 系统集成（Integration）
- 权限管理（Permission）
- 软件生态（Software Ecosystem） — CUDA、达芬奇装机量、Palantir Ontology

## Palantir 为什么特殊

Palantir 更像一家企业决策平台：

``` text
Enterprise Data
        ↓
Ontology
        ↓
Workflow
        ↓
AI Decision
```

它真正解决的是企业数据、流程和决策，而不是单纯提供模型。Palantir 的 Ontology 把企业数据结构化，让 AI 能在真实业务语境中做决策，而不是在实验室里跑 benchmark。

## 我的投资原则

研究一家 AI 公司时，我会问四个问题：

1. 谁最了解行业流程？
2. 谁拥有独特的数据？
3. 谁能把 AI 深度嵌入真实业务，而不仅仅是调用 API？
4. 谁能持续迭代产品，让客户愿意长期付费？

## 长期观察名单

### Compute

- NVIDIA（NVDA） — AI 算力生态 + CUDA 锁定
- AMD — MI450 挑战 NVDA，性价比路线
- TSMC（TSM） — AI 芯片制造垄断
- Cadence（CDNS） — EDA 双寡头，芯片复杂度受益者

### Infrastructure

- Broadcom（AVGO） — AI Networking + 定制 ASIC 双引擎
- AAOI — AI 光模块，垂直整合制造
- TTM Technologies（TTMI） — AI PCB / 基板
- Nebius（NBIS） — AI 云基础设施，NVIDIA 联盟

### Observability & Security

- Datadog（DDOG） — AI 应用监控
- Palo Alto Networks（PANW） — 网络安全平台化
- Zscaler（ZS） — 零信任安全

### Enterprise Data

- Palantir（PLTR） — 数据 + Ontology + 决策
- Snowflake（SNOW） — 企业数据底座
- Databricks — 企业 AI 平台（未上市）

### Workflow

- ServiceNow（NOW） — 企业 AI 工作流自动化
- Salesforce（CRM） — 企业客户数据 + Agentforce
- Microsoft（MSFT） — Azure + Copilot + OpenAI 生态

### Physical AI

- Tesla（TSLA） — Optimus 人形机器人 + Robotaxi
- Intuitive Surgical（ISRG） — 达芬奇手术机器人，装机量 = 长期耗材收入

## 结语

AI 本身会越来越便宜。

真正持续创造价值的，是那些能够利用 AI 深度结合行业知识、企业数据和业务流程，为客户创造实际利润的公司。

未来，我希望沿着**价值链**而不是**概念**来研究企业，因为价值最终会从算力逐渐迁移到真实业务世界。
