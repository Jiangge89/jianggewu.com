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
}

// TODO: Replace with real employment history
export const experiences: Experience[] = [
  {
    company: 'TODO: Company Name',
    role: 'TODO: Job Title',
    location: 'TODO: City, Country',
    startDate: 'TODO: Start Date',
    endDate: 'Present',
    summary: 'TODO: Brief summary of the role and its scope.',
    responsibilities: [
      'TODO: Key responsibility 1',
      'TODO: Key responsibility 2',
      'TODO: Key responsibility 3',
    ],
    achievements: [
      'TODO: Notable achievement 1',
      'TODO: Notable achievement 2',
    ],
    technologies: ['Go', 'Java', 'MySQL', 'Redis', 'Docker', 'AWS'],
  },
  {
    company: 'TODO: Previous Company Name',
    role: 'TODO: Previous Job Title',
    location: 'TODO: City, Country',
    startDate: 'TODO: Start Date',
    endDate: 'TODO: End Date',
    summary: 'TODO: Brief summary of the role.',
    responsibilities: [
      'TODO: Key responsibility 1',
      'TODO: Key responsibility 2',
    ],
    achievements: [
      'TODO: Notable achievement 1',
    ],
    technologies: ['Java', 'MySQL', 'Redis'],
  },
];
