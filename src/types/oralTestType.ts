export type OralExamCategory = 'placement_test' | 'course';

export interface OralTestType {
  id: string;
  title: string;
  category: OralExamCategory;
  templateId: string | null; // linked Test Template (for placement_test)
  description: string;
  duration: number; // minutes
  totalScore: number;
  evaluationCriteria: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OralTestTypeFormData {
  title: string;
  category: OralExamCategory;
  templateId: string | null;
  description: string;
  duration: number;
  totalScore: number;
  evaluationCriteria: string;
  isActive: boolean;
}
