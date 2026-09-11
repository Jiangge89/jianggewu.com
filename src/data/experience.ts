export interface Experience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  summary: string;
  responsibilities: string[];
  achievements: string[];
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
      'Led large-scale migration initiatives involving global KV systems, failover mechanisms, SDK unification, and multi-region service reliability improvements',
      'Designed scalable traffic control and intelligent rate-limiting systems supporting international product expansion and high-volume storage workloads',
      'Improved platform security and compliance through authentication systems, encrypted credential management, and multi-cloud infrastructure integrations',
      'Designed and shipped critical backend features for object storage APIs, including storage-class-aware operations and multi-cloud service support',
      'Maintained and improved business-critical distributed storage clusters serving multiple large-scale product teams',
    ],
    achievements: [],
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
      'Designed shared infrastructure components including caching libraries and circuit breaker systems for backend resilience and fault tolerance',
    ],
    achievements: [],
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
