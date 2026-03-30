export type QuestionType = 'single_choice' | 'multi_choice' | 'true_false';

export type MediaType = 'image' | 'video' | 'audio';

export interface QuestionAnswer {
  label: string; // e.g. "Option A", "Option B" or "True", "False"
  value: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  type: QuestionType;
  mediaUrl: string;
  mediaType: MediaType | '';
  answers: QuestionAnswer[];
  correctAnswer: string; // label of the correct answer
  order: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFormData {
  quizId: string;
  questionText: string;
  type: QuestionType;
  mediaUrl: string;
  mediaType: MediaType | '';
  answers: QuestionAnswer[];
  correctAnswer: string;
  order: number;
  points: number;
}
