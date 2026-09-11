export interface Experience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  summary: string;
  responsibilities: string[];
  achievements: {
    text: string;
    projects: { slug: string; label: string }[];
  }[];
  technologies: string[];
  logo?: string;
}

export const experiences: Experience[] = [
  {
    company: 'TikTok',
    role: 'Senior Software Engineer',
    location: 'Singapore',
    startDate: 'Mar 2022',
    endDate: 'May 2026',
    summary:
      'Owned and evolved TMeta, the metadata control plane for TikTok Object Storage (TOS), supporting globally distributed storage infrastructure.',
    responsibilities: [
      'Delivered object storage API features, including storage-class-aware operations and multi-cloud support.',
      'Maintained production storage clusters and improved failover mechanisms and SDK consistency across services.',
    ],
    achievements: [
      {
        text: 'Led the RDS-to-KV metadata migration on clusters across dozens of regions with zero downtime, preserving rollback safety throughout the rollout.',
        projects: [{ slug: 'rds-to-kv-online-migration', label: 'RDS to KV Online Migration' }],
      },
      {
        text: 'Led automated quota governance for ~60k buckets across 3 main regions (CN, SG, US), reducing excess allocated quota and progressively mitigating cluster oversubscription risk.',
        projects: [{ slug: 'quota-automation-traffic-governance', label: 'Quota Automation & Traffic Governance' }],
      },
      {
        text: 'Improved metadata security through credential encryption and standardized ByteKV authentication, completing both rollouts on clusters across dozens of regions with zero downtime.',
        projects: [
          { slug: 'credentials-encryption', label: 'Credentials Encryption' },
          { slug: 'bytekv-zti-authentication', label: 'ByteKV ZTI Authentication' },
        ],
      },
    ],
    technologies: ['Go', 'Distributed Systems', 'Redis', 'Kafka', 'Cloud Infrastructure', 'Object Storage'],
    logo: '/images/companies/tiktok.png',
  },
  {
    company: 'Shopee',
    role: 'Senior Software Engineer',
    location: 'Singapore',
    startDate: 'Sep 2018',
    endDate: 'Mar 2022',
    summary:
      'Developed and maintained backend systems supporting high-scale e-commerce promotion platforms including Flash Sales and Voucher systems.',
    responsibilities: [
      'Designed distributed cache purging systems supporting backend architecture migration and service scalability',
      'Built automated stress testing tools using production traffic replay to improve reliability validation and system capacity planning',
    ],
    achievements: [
      {
        text: 'Designed and optimized a two-layer cache for homepage promotion traffic, reducing backend dependency during flash-sale spikes and improving serving resilience.',
        projects: [{ slug: 'promotion-gateway-cache', label: 'Promotion Gateway & Double-Layer Cache' }],
      },
      {
        text: 'Built reusable infrastructure libraries and dependency-management tooling, improving engineering consistency and visibility into library adoption, versions, and upgrades across teams.',
        projects: [{ slug: 'platform-library-engineering', label: 'Platform Library Engineering & Adoption' }],
      },
    ],
    technologies: ['Python', 'Go', 'Redis', 'Memcached', 'Distributed Systems', 'Microservices'],
    logo: '/images/companies/shopee.jpg',
  },
  {
    company: 'Works Applications',
    role: 'Software Engineer',
    location: 'Singapore',
    startDate: 'Nov 2016',
    endDate: 'Sep 2018',
    summary:
      'Designed backend workflows and distributed batch processing systems supporting enterprise mail platform services.',
    responsibilities: [
      'Implemented scalable contact data import systems using Cassandra, Kafka, and asynchronous processing',
      'Managed development infrastructure and containerized local environments to improve engineering productivity',
    ],
    achievements: [],
    technologies: ['Java', 'Kafka', 'Cassandra', 'Docker'],
    logo: '/images/companies/works-applications.jpg',
  },
];

export interface Education {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  logo?: string;
}

export const education: Education[] = [
  {
    institution: 'Nanyang Technological University',
    degree: 'Master of Science in Information Systems',
    location: 'Singapore',
    startDate: 'Aug 2015',
    endDate: 'Jul 2016',
    gpa: '4.05 / 5.00',
    logo: '/images/education/ntu.png',
  },
  {
    institution: 'Tianjin University',
    degree: 'Bachelor of Engineering in Software Engineering',
    location: 'China',
    startDate: 'Sep 2009',
    endDate: 'Jul 2013',
    gpa: '3.15 / 4.00',
    logo: '/images/education/tju.png',
  },
];
