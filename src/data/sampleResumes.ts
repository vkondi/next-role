/**
 * Sample Resumes Configuration
 * Defines available sample resumes for new users to explore the application
 */

export interface SampleResume {
  id: string;
  title: string;
  subtitle: string;
  filename: string;
  icon: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'entry-level-marketing',
    title: 'Entry-Level Marketing',
    subtitle: 'Amara Okonkwo',
    filename: 'Entry-Level Marketing Resume - Amara Okonkwo.txt',
    icon: '📊',
  },
  {
    id: 'mid-level-software',
    title: 'Mid-Level Software Engineer',
    subtitle: 'Chen Wei',
    filename: 'Mid-Level Software Engineer - Chen Wei.txt',
    icon: '💻',
  },
  {
    id: 'executive-finance',
    title: 'Executive Finance',
    subtitle: 'Lars Andersson',
    filename: 'Executive Finance Resume - Lars Andersson.txt',
    icon: '💰',
  },
  {
    id: 'senior-healthcare',
    title: 'Senior Healthcare',
    subtitle: 'Priya Malhotra',
    filename: 'Senior Healthcare Resume - Priya Malhotra.txt',
    icon: '🏥',
  },
];
