export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectDiagram {
  title: string;
  mermaid: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export type TextBlock = string | string[];

export interface Project {
  slug: string;
  title: string;
  company: string;
  description: string;
  problem: TextBlock;
  role: TextBlock;
  approach: TextBlock;
  keyDesign: string[];
  keyDecisions: string[];
  challenges?: string[];
  techStack: string[];
  result: TextBlock;
  learned: TextBlock;
  summary: { problem: string; role: string; result: string };
  featured: boolean;
  highlighted?: boolean;
  outcome?: string;
  icon?: string;
  links?: ProjectLink[];
  diagrams?: ProjectDiagram[];
  images?: ProjectImage[];
}

export const projects: Project[] = [
  // --- TikTok ---
  {
    slug: 'tos-metadata-control-plane',
    summary: {
      problem: "Keep object-storage metadata available under heavy read traffic and backend failures.",
      role: "Owned TMeta, including cache design, credential security, and the RDS-to-KV migration.",
      result: "Supported ~160k reads/s per region across dozens of virtual regions.",
    },
    title: 'TOS Metadata Control Plane',
    company: 'TikTok',
    description:
      'Owned and evolved TMeta, the metadata control plane for TikTok Object Storage (TOS), supporting globally distributed storage infrastructure with cache-first serving and graceful degradation.',
    problem:
      'Object storage metadata was a critical dependency for every read/write request. The workload was extremely read-heavy (peaking at ~160k reads/s per region) and write-light (<1k writes/s). The system needed to serve metadata at scale across dozens of virtual regions (US, Southeast Asia, China, Europe) while tolerating backend failures gracefully.',
    role:
      'System owner responsible for the metadata control plane — designing cache logic, credential security, authentication integration, and leading the backend migration from RDS to KV.',
    approach:
      'Built a cache-first serving strategy with multiple layers of backend protection. Cache warmup on startup prevented cold-start stampedes during large-scale restarts. TTL jitter randomized expiration times to prevent cache avalanche. Singleflight coalesced concurrent requests for the same key to prevent cache breakdown on hot-key expiry. Negative caching (caching 404 responses) prevented cache penetration from queries on non-existent buckets. Async refresh combined with singleflight kept hot entries fresh without blocking callers. Graceful degradation extended cache timestamps and returned stale data when the underlying DB/KV experienced failures.',
    keyDesign: [
      'Cache-first serving with stale-tolerant refresh and configurable TTL tiers',
      'Cache warmup on startup to prevent cold-start stampede when instances restart at scale',
      'TTL jitter to randomize expiration times and prevent cache avalanche (mass simultaneous expiry)',
      'Singleflight to coalesce concurrent requests for the same key, preventing cache breakdown on hot-key expiry',
      'Negative caching (cache 404 responses) to prevent cache penetration from queries on non-existent buckets',
      'Async refresh for warm-but-aging entries, sync load for cold misses',
      'Graceful degradation: extend cache timestamps and return stale data on backend errors',
    ],
    keyDecisions: [
      'Prioritized availability over consistency — when the DB was down, reads continued serving stale cached data while writes failed; this was acceptable because the workload was overwhelmingly read-heavy and metadata staleness was tolerable',
      'Metadata writes were infrequent (<1k/s) and not latency-sensitive, making write failures during DB outages an acceptable trade-off for uninterrupted read availability',
      'Optimized backend protection under high read traffic rather than optimizing write paths',
    ],
    techStack: ['Go', 'Redis', 'KV Store', 'Distributed Systems', 'Object Storage'],
    result:
      'Maintained and improved a business-critical metadata control plane handling ~160k reads/s per region across dozens of virtual regions globally, serving multiple large-scale product teams with high availability.',
    learned:
      'Deepened understanding of cache design trade-offs at scale — defending against the classic cache failure modes (avalanche, breakdown, penetration), knowing when to serve stale data, and how to build degradation strategies that keep services available during partial outages.',
    featured: true,
    diagrams: [
      {
        title: 'Metadata Control Plane Architecture',
        mermaid: `flowchart LR
    Gateway[Storage Gateway API]
    subgraph Meta[Metadata Control Plane]
        Cache[Local Memory Cache]
        Logic[Metadata APIs / Business Logic]
        Auth[ZTI Authentication]
        Encrypt[Credential Encryption]
        Validate[Validation]
        Cache --> Logic
        Logic --> Auth
        Logic --> Encrypt
        Logic --> Validate
    end
    Gateway --> Cache
    Logic --> KV[(KV Store)]
    Logic -. legacy / migration .-> SQL[(SQL / RDS)]`,
      },
      {
        title: 'Cache Flow',
        mermaid: `flowchart TD
    A[Request Metadata] --> B{Cache Exists?}
    B -- No --> C[SingleFlight Sync Load from DB/KV]
    C --> D[Update Cache]
    D --> E[Return Metadata]
    B -- Yes --> F{Age < TTL/2?}
    F -- Yes --> E
    F -- No --> G{Age < TTL?}
    G -- Yes --> H[Return Cached Immediately]
    H --> I[Trigger Async Refresh]
    I --> J[SingleFlight Async Load]
    J --> D
    G -- No --> K[SingleFlight Sync Refresh]
    K --> D
    C -. DB/KV Error .-> M[Return Internal Error]
    J -. DB/KV Error .-> L[Extend Cache / Return Old]
    K -. DB/KV Error .-> L`,
      },
    ],
  },
  {
    slug: 'rds-to-kv-online-migration',
    outcome: 'Zero downtime · Dozens of regions',
    summary: {
      problem: "Move critical metadata from RDS to KV without downtime or data loss.",
      role: "Led the system design and implementation, partnered with SRE on the production rollout, and monitored system health throughout the migration.",
      result: "Completed the online migration on clusters across dozens of regions, with zero downtime and rollback safety throughout.",
    },
    highlighted: true,
    title: 'RDS to KV Online Migration',
    company: 'TikTok',
    description:
      'Migrated the metadata backend from RDS to KV without downtime using a 6-stage rollout strategy with dual-write, backfill, consistency verification, and rollback safety at every phase.',
    problem:
      'The metadata control plane needed to migrate its persistence layer from RDS to KV for better scalability, but the service was a critical dependency for object access — any downtime or data loss was unacceptable.',
    role:
      'Led the system design and implementation, partnered with SRE on the production rollout, and monitored system health throughout the migration.',
    approach:
      'Designed a 6-stage online migration: (1) introduce migration wrapper with RDS as sole backend, (2) enable dual-write from RDS to KV, (3) backfill historical data with a migration tool, (4) switch primary to KV with RDS as secondary, (5) run consistency verification and repair using updatedAt timestamps, (6) cut over to KV-only. Each stage supported rollback to RDS.',
    keyDesign: [
      'Migration wrapper abstracting the storage layer for dynamic traffic switching',
      'Dual-write strategy during transition with configurable write ordering',
      'Backfill tool for copying existing records from RDS to KV',
      'Consistency verification with timestamp-based repair mechanism',
      'Rollback capability maintained at every migration phase',
    ],
    keyDecisions: [
      'Favored migration safety over rollout simplicity — staged approach over big-bang cutover',
      'Maintained rollback capability at every phase to reduce risk',
      'Used dynamic configuration for traffic switching rather than code deployments',
    ],
    challenges: [
      'Ensuring correctness during zero-downtime migration',
      'Preventing data inconsistency between RDS and KV during dual-write',
      'Designing safe rollback under partial rollout failure',
    ],
    techStack: ['Go', 'RDS', 'KV Store', 'Distributed Systems'],
    result:
      'Successfully completed the online metadata backend migration on clusters across dozens of regions with zero downtime, preserving rollback safety throughout the migration and reducing migration risk without service disruption.',
    learned:
      'Gained deep experience in online migration patterns — dual-write, staged rollout, consistency verification, and the importance of rollback-safe design in mission-critical systems.',
    featured: true,
    diagrams: [
      {
        title: 'Migration Rollout Stages',
        mermaid: `flowchart LR
    S0["Stage 0\\nRDS Only"]
    S1["Stage 1\\nMigration Wrapper\\nRead/Write: RDS"]
    S2["Stage 2\\nDual Write\\nWrite: RDS → KV\\nRead: RDS"]
    S3["Stage 3\\nBackfill\\nExisting Data"]
    S4["Stage 4\\nKV Primary\\nWrite: KV → RDS\\nRead: KV"]
    S5["Stage 5\\nConsistency\\nVerification"]
    S6["Stage 6\\nKV Only"]
    S0 --> S1 --> S2 --> S3 --> S4 --> S5 --> S6
    R["Rollback to RDS"]
    S1 -. rollback .-> R
    S2 -. rollback .-> R
    S4 -. rollback .-> R
    S5 -. rollback .-> R`,
      },
    ],
  },
  {
    slug: 'credentials-encryption',
    summary: {
      problem: "Protect plaintext AK/SK credentials against database exposure.",
      role: "Led the project from system design and implementation through production rollout, monitoring system health throughout the rollout.",
      result: "Rolled out credential protection to clusters across dozens of regions with zero downtime.",
    },
    title: 'Credentials Encryption',
    company: 'TikTok',
    description:
      'Introduced encryption for sensitive AK/SK credentials in the metadata persistence layer with backward-compatible rollout and zero-downtime deployment.',
    problem:
      'Sensitive credentials (AK/SK) were stored in plaintext in the metadata persistence layer. Security hardening was required to reduce the blast radius of potential database exposure.',
    role:
      'Led the project from system design and implementation through production rollout, monitoring system health throughout the rollout. Designed and implemented the credential encryption layer and a backward-compatible rollout strategy.',
    approach:
      'Introduced a credential security layer that encrypts credentials before persistence and conditionally decrypts on authorized read paths. Rolled out with a feature switch: decryption logic was always enabled for backward compatibility, encryption was enabled for new writes, and historical plaintext records were backfilled via a migration tool.',
    keyDesign: [
      'Encrypt credentials before persistence, conditional decryption on authorized read paths',
      'Feature switch for gradual encryption rollout',
      'Always-on decryption for backward compatibility with existing plaintext records',
      'Migration tool to backfill encryption for historical credentials',
    ],
    keyDecisions: [
      'Introduced encryption without requiring a coordinated service-wide cutover',
      'Maintained backward compatibility for existing plaintext records during rollout',
      'Used feature switches to control rollout pace and enable rollback',
    ],
    challenges: [
      'Introducing encryption without service downtime',
      'Maintaining backward compatibility for existing plaintext records',
      'Avoiding read/write disruption during rollout',
    ],
    techStack: ['Go', 'KV Store', 'Encryption'],
    result:
      'Reduced blast radius of database exposure, improved metadata security posture, and completed the credential protection rollout on clusters across dozens of regions with zero downtime.',
    learned:
      'Learned the value of backward-compatible security rollouts — applying encryption incrementally with always-on decryption avoids the fragility of big-bang security migrations.',
    featured: false,
    diagrams: [
      {
        title: 'Credential Encryption Flow',
        mermaid: `flowchart LR
    Caller[Admin / Gateway / Authorized Service]
    Caller --> Meta[Metadata Service]
    Meta --> Policy[Credential Security Layer]
    Policy --> Enc[Encrypt Before Persistence]
    Policy --> Dec[Conditional Decryption]
    Enc --> KV[(KV Store)]
    Dec --> Caller2[Authorized Caller]`,
      },
    ],
  },
  {
    slug: 'quota-automation-traffic-governance',
    outcome: '~60k buckets · 3 main regions',
    summary: {
      problem: "Reclaim excess quota safely while reducing manual requests and cluster oversubscription risk.",
      role: "Led the service’s evolution and design across multiple versions, including safety policies, production rollout, and customer onboarding. Another internal team provided the prediction model.",
      result: "Onboarded ~60k buckets across CN, SG, and US, reducing excess allocated quota.",
    },
    highlighted: true,
    title: 'Quota Automation & Traffic Governance',
    company: 'TikTok',
    description:
      'Designed and built an automated capacity-governance system from scratch to address TOS throughput oversubscription risk. The system gradually reclaimed unused quota through conservative prediction validation, asymmetric scale-down/scale-up policies, progressive rollout with customer onboarding, and tidal throttling for peak-hour protection.',
    problem: [
      'The storage platform had accumulated a large amount of historically allocated quota. As customer workloads evolved, many buckets retained significantly more quota than their actual traffic required. Eventually, the sum of allocated quota exceeded the physical capacity that the storage clusters could safely support.',
      'At the same time, frequent quota adjustment requests from users had to be processed manually by the TOS team, creating a significant and growing operational burden.',
      'The core challenge was not simply identifying underutilized buckets. Customer traffic could fluctuate significantly, and some buckets carried critical workloads. A prediction that underestimated legitimate peak traffic could result in an automated quota reduction that affected production traffic. At the same time, automatically increasing quota too aggressively could worsen the existing oversubscription.',
      'This created two asymmetric risks: scale-down risk (reducing quota too aggressively could affect customer traffic) and scale-up risk (increasing quota too aggressively could increase pressure on an already oversubscribed cluster). The system needed to optimize for safe automation rather than maximum automation coverage.',
    ],
    role:
      'Led the service’s evolution and design across multiple versions, including safety policies, production rollout, and customer onboarding. The traffic prediction model (based on 21-day historical data) was provided by another internal team. I designed and implemented the service-side logic, including prediction validation, policy evaluation, guardrails, execution, notification, and tidal throttling.',
    approach: [
      'Built a daily scheduled quota-governance service that consumed 21-day traffic predictions, validated them against recent observed traffic, applied asymmetric policies for scale-down vs. scale-up, and enforced quota changes with bounded blast radius.',
      'Predictions were treated as a signal rather than ground truth. Each prediction was compared against the maximum traffic observed in the previous 7 days. If the prediction fell below this floor, the adjustment was skipped. Missing or stale prediction data was handled similarly — the bucket was skipped rather than acting on unreliable input. This intentionally conservative approach preferred reclaiming slightly less capacity over incorrectly throttling valid customer traffic.',
      'For scale-down, quota was reduced by at most 5% per day — an operational threshold chosen to keep each adjustment small enough to limit customer impact while remaining meaningful and observable, creating time for monitoring and customer feedback before further reductions.',
      'For scale-up, the system applied tiered review gates: small buckets could auto-approve increases within ~20%, while larger increases or larger buckets required human review. The objective was not to automate every possible change, but to automate changes where the blast radius was well understood.',
      'The system was rolled out progressively: V1 validated the architecture on internal test buckets including ones I owned directly; V2 introduced production scale-down with batch onboarding starting from lower-criticality workloads, requiring customer communication, documentation, and exemption processes; V3 expanded to controlled scale-up with stricter thresholds.',
      'Beyond static quota automation, the system included tidal traffic governance to temporarily restrict quota for high-throughput buckets during predictable peak periods — addressing acute traffic pressure that long-term quota governance alone could not handle.',
    ],
    keyDesign: [
      'Prediction validation: compare 21-day traffic prediction against 7-day observed max traffic; skip adjustment if prediction falls below the floor — prefer no action over unsafe action',
      'Gradual scale-down: at most 5% reduction per day — an operational threshold balancing meaningful progress with bounded customer impact, creating time for monitoring and feedback',
      'Tiered scale-up: small-traffic buckets auto-approve increases ≤20%; larger increases or larger buckets require human review — automate where blast radius is understood, review where it is not',
      'Whitelist exemption: bucket owners can opt out of automatic adjustment for workloads that should not participate',
      'Tidal throttling: temporarily lower quota for high-throughput buckets during configurable peak-hour windows, with alerts on restoration failures',
      'Lark notification to bucket owners on every quota change with before/after values',
      'Bucket-level metrics and monitoring for quota decisions, adjustments, and errors',
    ],
    keyDecisions: [
      'Treated predictions as signals, not ground truth — conservative validation against recent observed traffic to avoid acting on anomalous forecasts',
      'Applied asymmetric risk policies: scale-down protected customers (gradual, rate-limited), scale-up protected the platform (tiered review gates)',
      'Constrained blast radius at multiple levels: daily adjustment limits, bucket-size tiers, manual review thresholds, whitelist exemptions, and progressive rollout',
      'Deliberately chose not to automate every decision — low-risk changes were automated, high-risk changes remained under human review',
      'Production rollout included people: customer communication, documentation, exemption processes, and operational onboarding were part of productionizing the system, not afterthoughts',
    ],
    challenges: [
      'The hardest part was not implementing the automation, but deciding what we could safely automate under uncertain traffic demand and imperfect predictions',
      'Rolling out a system that could automatically modify customer quota required organizational readiness beyond technical readiness — contacting bucket owners, explaining the governance mechanism, preparing documentation, and handling exemption requests',
      'Balancing automation coverage against safety: maximizing reclaimed quota would increase the chance of disrupting legitimate traffic, while being too conservative would fail to address the oversubscription risk',
      'Failure handling favored skipping over retrying — individual execution failures were skipped since the daily job would re-evaluate; tidal throttling restoration failures triggered alerts for manual intervention',
    ],
    techStack: ['Go', 'Distributed Rate Limiter', 'Kafka', 'Lark API', 'Object Storage'],
    result: [
      'Onboarded ~60k buckets across three major regions (CN ~40k, SG ~10k, US ~10k) into automated quota governance. Reduced the total amount of unnecessarily allocated quota and progressively mitigated storage-cluster oversubscription risk.',
      'Transformed quota governance from a largely manual and reactive process into a continuous automated mechanism with conservative prediction validation, gradual quota adjustment, bounded automatic scale-up, human override and review, progressive rollout, bucket-level observability, and customer-facing operational processes. Tidal throttling provided additional layered defense against acute traffic pressure during peak periods.',
    ],
    learned: [
      'Capacity governance requires asymmetric safety strategies because different actions introduce different types of production risk — scale-down must protect users while scale-up must protect the platform.',
      'Automation should be conservative when inputs are uncertain: predictions are signals, not ground truth, and no action is preferable to unsafe action. The blast radius of automated decisions must be constrained at multiple levels.',
      'Production rollout includes people — a system can be technically ready before the organization and its users are ready for it.',
      'If I were evolving the system further, I would separate policy evaluation from quota execution with a durable execution layer, making individual operations independently recoverable with idempotent updates and bounded retries.',
    ],
    featured: true,
    diagrams: [
      {
        title: 'Quota Automation Pipeline',
        mermaid: `flowchart TD
    Pred[21-Day Traffic Predictions\\nfrom upstream team]
    Filter1[Filter Whitelisted Buckets]
    Validate{Prediction ≥\\n7-Day Max Traffic?}
    Skip1[Skip Bucket]
    Decision{Scale Down\\nor Scale Up?}
    Down[Gradual Scale Down\\nMax 1x/day, ≤5% reduction]
    Up{Bucket Size\\nTier?}
    SmallCheck{Increase\\n≤ 20%?}
    SmallAuto[Auto Approve]
    SmallReview[Human Review]
    LargeReview[Human Review]
    Apply[Apply Quota Change]
    Metrics[Record Metrics]
    Notify[Lark Notification\\nold → new quota]
    Pred --> Filter1 --> Validate
    Validate -- no --> Skip1
    Validate -- yes --> Decision
    Decision -- scale down --> Down --> Apply
    Decision -- scale up --> Up
    Up -- small bucket --> SmallCheck
    Up -- large bucket --> LargeReview --> Apply
    SmallCheck -- yes --> SmallAuto --> Apply
    SmallCheck -- no --> SmallReview --> Apply
    Apply --> Metrics --> Notify`,
      },
      {
        title: 'Progressive Rollout Strategy',
        mermaid: `flowchart LR
    V1["V1\\nInternal Validation\\nOwn test buckets"]
    V2["V2\\nProduction Scale-Down\\nBatch onboarding\\nCustomer communication"]
    V3["V3\\nControlled Scale-Up\\nStricter thresholds\\nHuman review gates"]
    V1 --> V2 --> V3`,
      },
      {
        title: 'Layered Capacity Defense',
        mermaid: `flowchart TD
    subgraph Long["Long-Term: Quota Automation"]
        QA[Daily Scheduled Job]
        QA --> Align[Gradually align allocated\\nquota with actual demand]
    end
    subgraph Short["Short-Term: Tidal Throttling"]
        Peak[Peak Hour Trigger]
        Peak --> Restrict[Temporarily restrict\\nhigh-throughput buckets]
        Restrict --> Restore[Restore after peak]
    end
    Long --- Short
    Risk[Platform Capacity Risk]
    Long --> Risk
    Short --> Risk`,
      },
    ],
  },
  {
    slug: 'bytekv-zti-authentication',
    summary: {
      problem: "Replace unauthenticated ByteKV access with secure service identity.",
      role: "Evaluated authentication options and executed a staged ZTI rollout with rollback support.",
      result: "Rolled out standardized database authentication to clusters across dozens of regions with zero downtime.",
    },
    title: 'ByteKV ZTI Authentication',
    company: 'TikTok',
    description:
      'Integrated ZTI-based authentication for ByteKV database access, replacing unauthenticated access with a standardized, identity-based security model via staged online rollout.',
    problem:
      'ByteKV access originally had no authentication. The metadata service needed standardized and secure database access to meet security requirements.',
    role:
      'Evaluated authentication solutions (DPS vs ZTI), selected ZTI for infrastructure standardization, and executed the staged rollout with rollback support.',
    approach:
      'Deployed ZTI capability first with authentication disabled, registered service identity, enabled compatibility mode (auth optional), then gradually enforced authentication with rollback support at each phase.',
    keyDesign: [
      'Staged rollout: deploy capability → register identity → compatibility mode → gradual enforcement',
      'Compatibility mode allowed both authenticated and unauthenticated access during transition',
      'Rollback support at every phase before full enforcement',
    ],
    keyDecisions: [
      'Selected ZTI over DPS for better infrastructure standardization, ownership, and service identity support',
      'Used compatibility mode before enforcement to prevent access disruption',
      'Maintained rollback capability during gradual rollout',
    ],
    challenges: [
      'Introducing authentication without service downtime',
      'Maintaining backward compatibility during rollout',
      'Preventing access disruption to the metadata service',
    ],
    techStack: ['Go', 'ZTI', 'ByteKV', 'Service Identity'],
    result:
      'Standardized ByteKV authentication, improved access security posture, and completed the rollout on clusters across dozens of regions with zero downtime.',
    learned:
      'Reinforced the pattern of staged security rollouts — compatibility mode before enforcement is essential for zero-downtime security changes in production systems.',
    featured: false,
    diagrams: [
      {
        title: 'Staged Authentication Rollout',
        mermaid: `flowchart LR
    S0[Stage 0\\nNo Auth]
    S1[Stage 1\\nDeploy ZTI\\nAuth Disabled]
    S2[Stage 2\\nRegister\\nService Identity]
    S3[Stage 3\\nCompatibility Mode\\nAuth Optional]
    S4[Stage 4\\nGradual Rollout]
    S5[Stage 5\\nAuth Enforced]
    S0 --> S1 --> S2 --> S3 --> S4 --> S5
    R[Rollback]
    S3 -. rollback .-> R
    S4 -. rollback .-> R`,
      },
    ],
  },

  // --- Shopee ---
  {
    slug: 'promotion-gateway-cache',
    summary: {
      problem: "Reduce backend fan-out and latency spikes during homepage flash sales.",
      role: "Worked on the gateway API and designed and optimized its two-layer caching strategy.",
      result: "Reduced backend dependency during spikes and improved homepage serving resilience.",
    },
    title: 'Promotion Gateway & Double-Layer Cache',
    company: 'Shopee',
    description:
      'Built the gateway API serving homepage flash-sale traffic with a double-layer cache strategy (local memory + distributed Redis/Memcached) to reduce backend fan-out under traffic spikes.',
    problem:
      'The Shopee homepage served flash-sale traffic with high request volume and strict latency requirements. Backend fan-out to multiple promotion, voucher, and recommendation services caused latency spikes during traffic surges.',
    role:
      'Worked on the gateway API serving homepage promotion traffic, designed and optimized the double-layer cache strategy, and participated in performance and reliability optimization for high-QPS scenarios.',
    approach:
      'Implemented a cache-first serving strategy with two cache layers: a local in-memory cache with short expiration for hot data, and a distributed Redis/Memcached cache with mechanisms for cache invalidation. Data was serialized before cache storage for performance and cross-service compatibility.',
    keyDesign: [
      'Double-layer cache: local in-memory (short TTL) + distributed Redis/Memcached',
      'Cache-first serving strategy optimizing for latency over strict freshness',
      'Data serialization before cache storage for performance and compatibility',
      'Cache invalidation mechanism for the distributed layer',
    ],
    keyDecisions: [
      'Optimized for latency and resilience over strict data freshness',
      'Used local memory cache to absorb traffic spikes before hitting distributed cache',
      'Reduced backend fan-out during peak traffic to protect downstream services',
    ],
    techStack: ['Go', 'Python', 'Redis', 'Memcached', 'Microservices'],
    result:
      'Reduced backend dependency during traffic spikes, improved homepage serving resilience, and supported high-volume promotion traffic during flash sales.',
    learned:
      'Learned the effectiveness of multi-layer caching for high-traffic scenarios — local memory cache absorbs burst traffic that would otherwise overwhelm even distributed caches.',
    featured: false,
    diagrams: [
      {
        title: 'Promotion Gateway Architecture',
        mermaid: `flowchart LR
    Client[Shopee App Homepage]
    Client --> Gateway[Gateway API\\nAggregation Layer]
    Gateway --> L1[Local Memory Cache]
    L1 -->|cache miss| L2[Distributed Cache\\nRedis / Memcached]
    L2 -->|cache miss| P[Promotion Service]
    P --> PDB[(Promotion DB)]
    Gateway --> V[Voucher Service]
    V --> ADB[(Account DB)]
    Gateway --> R[Other Services]`,
      },
    ],
  },
  {
    slug: 'platform-library-engineering',
    summary: {
      problem: "Reduce inconsistent caching, circuit breaking, and rate limiting across Go services.",
      role: "Built shared libraries and tooling for dependency visibility and upgrade planning.",
      result: "Improved engineering consistency, dependency visibility, and library rollout.",
    },
    title: 'Platform Library Engineering & Adoption',
    company: 'Shopee',
    description:
      'Built reusable platform libraries (caching, circuit breaker, rate limiter) and a Library Management System to improve engineering consistency across teams during Shopee\'s Go migration.',
    problem:
      'As Shopee migrated toward Go services, common engineering patterns like caching, circuit breaking, and rate limiting became fragmented across teams. Different services implemented these patterns inconsistently, creating maintenance burden and reliability risk.',
    role:
      'Developed reusable infrastructure libraries, participated in library adoption strategy, and built management tooling for dependency visibility and upgrade planning.',
    approach:
      'Built a suite of reusable platform libraries (double-layer cache, circuit breaker, rate limiter) with standardized interfaces. Created a Library Management System providing visibility into service adoption, dependency mapping, library version usage, and documentation.',
    keyDesign: [
      'Reusable libraries with standardized interfaces: double-layer cache, circuit breaker, rate limiter',
      'Library Management System for adoption tracking and dependency mapping',
      'Version tracking and upgrade visibility across services',
      'Centralized library documentation',
    ],
    keyDecisions: [
      'Prioritized engineering consistency over per-team optimization',
      'Invested in visibility tooling to support safer library upgrades',
      'Reduced duplicated implementation effort by centralizing common patterns',
    ],
    techStack: ['Go', 'Redis', 'Memcached', 'Microservices'],
    result:
      'Improved engineering consistency across teams, achieved better visibility into service dependencies, and reduced friction for library rollout and upgrades.',
    learned:
      'Learned that reusable libraries succeed when paired with visibility tooling — teams adopt shared libraries more readily when they can see version usage, track dependencies, and plan upgrades safely.',
    featured: false,
    diagrams: [
      {
        title: 'Platform Library System',
        mermaid: `flowchart LR
    PT[Platform Team]
    PT --> DLL[Double Layer Cache Lib]
    PT --> CB[Circuit Breaker Lib]
    PT --> RL[Rate Limiter Lib]
    DLL --> LMS[Library Management System]
    CB --> LMS
    RL --> LMS
    LMS --> A[Service A]
    LMS --> B[Service B]
    LMS --> C[Service C]
    LMS --> V[Version Tracking]
    LMS --> U[Upgrade Visibility]
    LMS --> D[Dependency Mapping]`,
      },
    ],
  },

  // --- Duftee (Independent) ---
  {
    slug: 'moma-app',
    summary: {
      problem: "Make expense tracking across multiple currencies and accounts easier.",
      role: "Owned architecture, feature design, and backend development from concept to launch.",
      result: "Shipped a budgeting app with multi-currency tracking and spending analytics to the App Store.",
    },
    title: 'Moma',
    company: 'Duftee',
    description:
      'A budget management iOS app designed for multi-currency expense tracking, helping users monitor spending across different currencies and accounts without touching their real money.',
    problem:
      'People living or working across countries need to track expenses in multiple currencies. Most budgeting apps assume a single currency, making cross-border expense management cumbersome and error-prone.',
    role:
      'Responsible for architecture and feature design, and all backend development. Worked on the product from concept to App Store launch.',
    approach:
      'Built a native iOS app with Swift and SwiftUI for a smooth, responsive user experience. Designed a Go backend to handle multi-currency data, account management, and user sync. Focused on making daily expense recording as fast and frictionless as possible.',
    keyDesign: [
      'Multi-currency support with per-transaction currency selection (SGD, CNY, etc.)',
      'Three transaction types: Expense, Income, and Transfer between accounts',
      'Category-based expense classification for spending analysis',
      'Multiple account management (Cash, PayPal, Debit, etc.)',
      'Monthly and daily statistics with visual breakdowns',
      'Budget setting and tracking',
    ],
    keyDecisions: [
      'Chose native Swift/SwiftUI over cross-platform to deliver the best iOS experience',
      'Designed the data model to be currency-agnostic so adding new currencies requires no schema changes',
      'Prioritized recording speed — users can log an expense in a few taps',
    ],
    techStack: ['Swift', 'SwiftUI', 'Go', 'iOS'],
    result:
      'Shipped to the App Store as a fully functional budgeting app with multi-currency tracking, account management, and spending analytics.',
    learned:
      'Gained end-to-end experience shipping an iOS product — from architecture design and backend API development through App Store review and launch. Learned how product decisions around UX simplicity directly affect user adoption.',
    featured: true,
    icon: '/images/projects/moma/icon.svg',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/sg/app/id6448210631' },
      { label: 'Website', url: 'https://duftee.com/' },
    ],
    images: [
      {
        src: '/images/projects/moma/homepage.png',
        alt: 'Moma app homepage showing monthly expense and income summary with account balances',
        caption: 'Dashboard with monthly expense/income overview, multiple accounts (Cash, PayPal), and recent transaction history',
      },
      {
        src: '/images/projects/moma/recording.png',
        alt: 'Moma app expense recording screen with category selection and numeric keypad',
        caption: 'Quick expense recording with category classification (Food, Home, Dressing, etc.) and per-transaction currency selection',
      },
      {
        src: '/images/projects/moma/multi_currency.png',
        alt: 'Moma app multi-currency selection screen showing available currencies with country flags',
        caption: 'Multi-currency support — add and switch between currencies (SGD, EUR, USD, CNY, and more) for cross-border expense tracking',
      },
      {
        src: '/images/projects/moma/statistics.png',
        alt: 'Moma app statistics view with donut chart showing spending breakdown by category',
        caption: 'Monthly spending analytics with category breakdown and percentage visualization',
      },
    ],
  },
  {
    slug: 'chill-app',
    summary: {
      problem: "Provide structured exercise guidance and plans tailored to individual preferences.",
      role: "Led architecture, feature design, backend development, and part of the frontend.",
      result: "Core training, AI plans, history, and Apple Watch features are functional; App Store launch is in progress.",
    },
    title: 'Chill',
    company: 'Duftee',
    description:
      'A Kegel exercise training app that helps users create customized workout plans — either manually or via AI-generated recommendations based on personal preferences — and guides them through each session.',
    problem:
      'Kegel exercises are medically recommended for improving urinary incontinence, postpartum recovery, pelvic organ prolapse prevention, prostate health, and overall pelvic floor strength. However, most people lack structured guidance on how to train effectively, and generic plans don\'t account for individual needs.',
    role:
      'Responsible for architecture design, feature design, backend development, and some frontend work. Led the product from concept through development toward App Store launch.',
    approach:
      'Built a native iOS app with Swift and SwiftUI for guided exercise sessions with real-time feedback. Designed a Go backend to handle user data, training plans, and AI integration. Integrated an AI API to generate personalized training plans with dietary and lifestyle suggestions based on user preferences.',
    keyDesign: [
      'Guided exercise sessions with configurable sets, gaps, and reps',
      'AI-powered plan generation based on personal preferences and goals',
      'AI suggestions including dietary, resting, and lifestyle recommendations',
      'Training history tracking with 7-day summary, completion rates, and habit calendar',
      'Apple Watch companion app for hands-free workouts',
      'Discovery Hub with educational content on Kegel exercise benefits',
    ],
    keyDecisions: [
      'Integrated AI API for personalized plan generation rather than only offering preset templates',
      'Designed exercise data model to support both custom and AI-generated plans with the same structure',
      'Built Apple Watch companion for convenience during exercises',
    ],
    techStack: ['Swift', 'SwiftUI', 'Go', 'AI API', 'iOS', 'watchOS'],
    result:
      'In active development, approaching App Store launch. Core features — guided exercises, AI plan generation, training history, and Apple Watch support — are functional.',
    learned:
      'Gained experience integrating AI APIs into a consumer product — learned how to design the prompt and response pipeline to generate structured, actionable training plans from user preferences. Also deepened understanding of building companion watchOS apps.',
    featured: false,
    icon: '/images/projects/chill/icon.svg',
    images: [
      {
        src: '/images/projects/chill/homepage.png',
        alt: 'Chill app homepage with exercise configuration, AI training feature, and Apple Watch integration',
        caption: 'Home screen with configurable sets/gaps/reps, AI-powered training plan creation, and Apple Watch companion app',
      },
      {
        src: '/images/projects/chill/exercise.png',
        alt: 'Chill app exercise session in progress with animated mascot guiding the user',
        caption: 'Guided exercise session with real-time rep and set tracking, animated mascot providing visual feedback',
      },
      {
        src: '/images/projects/chill/aiplan.png',
        alt: 'Chill app AI-generated training plan with dietary suggestions',
        caption: 'AI-generated personalized training plan with exercise parameters and dietary/lifestyle recommendations',
      },
      {
        src: '/images/projects/chill/trending.png',
        alt: 'Chill app trending page showing training summary, habits, and monthly calendar',
        caption: 'Training history with 7-day summary, completion tracking, habit analysis, and monthly activity calendar',
      },
    ],
  },
];
