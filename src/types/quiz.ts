export type TestType = 'placement_test' | 'practice_exam' | 'final_exam';

export type QuestionStatus = 'pending' | 'saved';

export interface Quiz {
  id: string;
  title: string;
  testType: TestType;
  templateId: string | null; // linked Test Template (for placement_test type)
  instructions: string;
  totalQuestions: number; // auto-calculated
  timeLimit: number; // minutes
  isActive: boolean;
  isCurrent: boolean;
  questionsStatus: QuestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizFormData {
  title: string;
  testType: TestType;
  templateId: string | null;
  instructions: string;
  timeLimit: number;
  isActive: boolean;
  isCurrent: boolean;
}
