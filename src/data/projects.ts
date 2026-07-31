export interface Project {
  slug: string;
  title: string;
  company: string;
  description: string;
  problem: string;
  role: string;
  approach: string;
  keyDesign: string[];
  keyDecisions: string[];
  challenges?: string[];
  techStack: string[];
  result: string;
  learned: string;
  featured: boolean;
}

export const projects: Project[] = [
  // --- TikTok ---
  {
    slug: 'tos-metadata-control-plane',
    title: 'TOS Metadata Control Plane',
    company: 'TikTok',
    description:
      'Owned and evolved TMeta, the metadata control plane for TikTok Object Storage (TOS), supporting globally distributed storage infrastructure with cache-first serving and graceful degradation.',
    problem:
      'Object storage metadata was a critical dependency for every read/write request. The workload was read-heavy and write-light, with high metadata lookup traffic. The system needed to serve metadata at scale while tolerating backend failures gracefully.',
    role:
      'System owner responsible for the metadata control plane — designing cache logic, credential security, authentication integration, and leading the backend migration from RDS to KV.',
    approach:
      'Built a cache-first serving strategy with stale-tolerant refresh. Used async refresh combined with singleflight to protect the backend store under high read traffic. Implemented graceful degradation so the service could continue serving cached metadata when the underlying DB/KV experienced failures.',
    keyDesign: [
      'Cache-first serving with stale-tolerant refresh and configurable TTL tiers',
      'Async refresh + singleflight to coalesce concurrent cache misses',
      'Graceful degradation: extend cache timestamps and return stale data on backend errors',
      'Sync load for cold misses, async refresh for warm-but-aging entries',
    ],
    keyDecisions: [
      'Favored availability and resilience over strict metadata freshness',
      'Metadata writes were infrequent and not latency-sensitive, enabling aggressive caching',
      'Optimized backend protection under high read traffic rather than optimizing write paths',
    ],
    techStack: ['Go', 'Redis', 'KV Store', 'Distributed Systems', 'Object Storage'],
    result:
      'Maintained and improved a business-critical metadata control plane serving multiple large-scale product teams across globally distributed storage infrastructure.',
    learned:
      'Deepened understanding of cache design trade-offs at scale — when to serve stale data, how to protect backends with singleflight and async refresh, and how to build degradation strategies that keep services available during partial outages.',
    featured: true,
  },
  {
    slug: 'rds-to-kv-online-migration',
    title: 'RDS to KV Online Migration',
    company: 'TikTok',
    description:
      'Migrated the metadata backend from RDS to KV without downtime using a 6-stage rollout strategy with dual-write, backfill, consistency verification, and rollback safety at every phase.',
    problem:
      'The metadata control plane needed to migrate its persistence layer from RDS to KV for better scalability, but the service was a critical dependency for object access — any downtime or data loss was unacceptable.',
    role:
      'Designed the rollout strategy, implemented the migration wrapper and dual-write logic, built the consistency verification and repair flow, and participated in rollout and rollback planning.',
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
      'Successfully migrated the metadata backend online with zero downtime, preserving rollback safety throughout the migration and reducing migration risk without service disruption.',
    learned:
      'Gained deep experience in online migration patterns — dual-write, staged rollout, consistency verification, and the importance of rollback-safe design in mission-critical systems.',
    featured: true,
  },
  {
    slug: 'credentials-encryption',
    title: 'Credentials Encryption',
    company: 'TikTok',
    description:
      'Introduced encryption for sensitive AK/SK credentials in the metadata persistence layer with backward-compatible rollout and zero-downtime deployment.',
    problem:
      'Sensitive credentials (AK/SK) were stored in plaintext in the metadata persistence layer. Security hardening was required to reduce the blast radius of potential database exposure.',
    role:
      'Designed and implemented the credential encryption layer, including the rollout strategy for backward-compatible encryption adoption.',
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
      'Reduced blast radius of database exposure, improved metadata security posture, and achieved zero-downtime rollout for credential protection.',
    learned:
      'Learned the value of backward-compatible security rollouts — applying encryption incrementally with always-on decryption avoids the fragility of big-bang security migrations.',
    featured: false,
  },
  {
    slug: 'quota-automation-traffic-governance',
    title: 'Quota Automation & Traffic Governance',
    company: 'TikTok',
    description:
      'Built an automated quota management system with traffic prediction, safety guardrails, and enforcement through the metadata control plane and distributed rate limiter.',
    problem:
      'Manual quota tuning could not scale with dynamic traffic growth across storage tenants. Incorrect quota settings risked either throttling legitimate traffic or allowing overload on storage backends.',
    role:
      'Participated in the quota automation workflow, worked on metadata integration and enforcement path, and improved traffic governance reliability.',
    approach:
      'Built a pipeline that predicts traffic based on historical metrics, generates automated quota recommendations with safety buffers and guardrails, and enforces quotas through the metadata control plane and a distributed rate limiter. Manual override and whitelist support preserved operational flexibility.',
    keyDesign: [
      'Traffic prediction based on historical metrics',
      'Automated quota generation with safety buffer and guardrails',
      'Manual override and whitelist for operational flexibility',
      'Enforcement through metadata control plane and distributed rate limiter',
    ],
    keyDecisions: [
      'Favored safe over-aggressive scaling to avoid throttling legitimate traffic',
      'Introduced safety guardrails to reduce prediction risk',
      'Preserved manual override for operational flexibility during incidents',
    ],
    techStack: ['Go', 'Distributed Rate Limiter', 'Metrics', 'Object Storage'],
    result:
      'Reduced manual operational burden for quota management, improved quota rollout safety, and achieved better resilience against traffic spikes.',
    learned:
      'Learned that automation in capacity management needs both prediction intelligence and human override — fully automated systems without guardrails or manual escape hatches create operational risk.',
    featured: false,
  },
  {
    slug: 'bytekv-zti-authentication',
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
      'Standardized ByteKV authentication, improved access security posture, and completed the rollout with zero downtime.',
    learned:
      'Reinforced the pattern of staged security rollouts — compatibility mode before enforcement is essential for zero-downtime security changes in production systems.',
    featured: false,
  },

  // --- Shopee ---
  {
    slug: 'promotion-gateway-cache',
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
    featured: true,
  },
  {
    slug: 'platform-library-engineering',
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
  },

  // --- Personal Projects ---
  {
    slug: 'health-exercise-ios-app',
    title: 'Health Exercise iOS App',
    company: 'Personal',
    description:
      'An iOS health application that provides personalized exercise guidance, reminders and user progress tracking, powered by AI-generated recommendations.',
    problem:
      'Users needed a simple, personalized way to receive exercise guidance and track their fitness progress without complex gym apps.',
    role:
      'Full-stack developer responsible for backend API design, database architecture, and AI integration.',
    approach:
      'Built a Swift/SwiftUI iOS frontend backed by Go APIs and MySQL. Integrated AI-powered exercise recommendations to provide personalized guidance based on user profiles.',
    keyDesign: [
      'AI-powered exercise recommendation engine via API integration',
      'Backend APIs designed for both real-time and batch workloads',
      'Local data storage with server sync for offline access',
      'Reminder and notification system for user engagement',
    ],
    keyDecisions: [
      'Chose Go for the backend to keep the API layer lightweight and performant',
      'Used AI APIs for exercise recommendation generation rather than building a rules engine',
      'Implemented local data storage for offline access with server sync',
    ],
    techStack: ['Swift', 'SwiftUI', 'Go', 'MySQL', 'AI API'],
    result:
      'Delivered a working iOS app with personalized exercise plans, reminder notifications, and progress tracking.',
    learned:
      'Gained hands-on experience integrating AI APIs into a production mobile app and designing backend systems that serve both real-time and batch workloads.',
    featured: true,
  },
  {
    slug: 'vip-subscription-referral-system',
    title: 'VIP Subscription and Referral System',
    company: 'Personal',
    description:
      'A backend system supporting free trials, referral rewards, Apple subscriptions and promotional access with idempotent payment processing.',
    problem:
      'The product needed a flexible monetization layer supporting multiple subscription paths, referral incentives, and Apple In-App Purchase integration.',
    role:
      'Backend developer responsible for the subscription and referral system design and implementation.',
    approach:
      'Designed a Go backend handling referral code validation, VIP state management, and Apple StoreKit webhook processing. Focused on idempotency and correctness for payment-related flows.',
    keyDesign: [
      'Idempotent webhook handlers for Apple subscription notifications',
      'Separated referral validation from reward granting for auditability',
      'Expiration and renewal logic handling trial-to-paid transition edge cases',
    ],
    keyDecisions: [
      'Designed idempotent webhook handlers to safely process Apple subscription notifications',
      'Separated referral validation from reward granting for auditability',
      'Built expiration and renewal logic to handle edge cases in trial-to-paid transitions',
    ],
    techStack: ['Go', 'MySQL', 'Apple StoreKit', 'Webhooks'],
    result:
      'Shipped a reliable subscription system handling free trials, referral rewards, and Apple subscription lifecycle events.',
    learned:
      'Deepened understanding of payment system design, idempotent processing patterns, and the complexity of Apple subscription state machines.',
    featured: false,
  },
  {
    slug: 'moma-app',
    title: 'Moma',
    company: 'Personal',
    description:
      'TODO: Add a description of the Moma application.',
    problem: 'TODO: Describe the problem Moma solves.',
    role: 'TODO: Describe your role.',
    approach: 'TODO: Describe the technical approach.',
    keyDesign: ['TODO: Key design point'],
    keyDecisions: ['TODO: Key decision'],
    techStack: ['TODO: Add technologies'],
    result: 'TODO: Describe the outcome.',
    learned: 'TODO: What did you learn?',
    featured: false,
  },
  {
    slug: 'chill-app',
    title: 'Chill',
    company: 'Personal',
    description:
      'TODO: Add a description of the Chill application.',
    problem: 'TODO: Describe the problem Chill solves.',
    role: 'TODO: Describe your role.',
    approach: 'TODO: Describe the technical approach.',
    keyDesign: ['TODO: Key design point'],
    keyDecisions: ['TODO: Key decision'],
    techStack: ['TODO: Add technologies'],
    result: 'TODO: Describe the outcome.',
    learned: 'TODO: What did you learn?',
    featured: false,
  },
];
