export interface Project {
  slug: string;
  title: string;
  description: string;
  problem: string;
  role: string;
  approach: string;
  keyDecisions: string[];
  techStack: string[];
  result: string;
  learned: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: 'health-exercise-ios-app',
    title: 'Health Exercise iOS App',
    description:
      'An iOS health application that provides personalized exercise guidance, reminders and user progress tracking.',
    problem:
      'Users needed a simple, personalized way to receive exercise guidance and track their fitness progress without complex gym apps.',
    role: 'Full-stack developer responsible for backend API design, database architecture, and AI integration.',
    approach:
      'Built a Swift/SwiftUI iOS frontend backed by Go APIs and MySQL. Integrated AI-powered exercise recommendations to provide personalized guidance based on user profiles.',
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
    description:
      'A backend system supporting free trials, referral rewards, Apple subscriptions and promotional access.',
    problem:
      'The product needed a flexible monetization layer supporting multiple subscription paths, referral incentives, and Apple In-App Purchase integration.',
    role: 'Backend developer responsible for the subscription and referral system design and implementation.',
    approach:
      'Designed a Go backend handling referral code validation, VIP state management, and Apple StoreKit webhook processing. Focused on idempotency and correctness for payment-related flows.',
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
    featured: true,
  },
  {
    slug: 'backend-system-project',
    title: 'Backend System Project',
    description:
      'TODO: Add a description of a significant backend system you have built or contributed to.',
    problem: 'TODO: Describe the problem this system solved.',
    role: 'TODO: Describe your role in this project.',
    approach: 'TODO: Describe the technical approach and architecture.',
    keyDecisions: [
      'TODO: Key decision 1',
      'TODO: Key decision 2',
      'TODO: Key decision 3',
    ],
    techStack: ['TODO: Add technologies'],
    result: 'TODO: Describe the outcome and impact.',
    learned: 'TODO: What did you learn from this project?',
    featured: false,
  },
];
