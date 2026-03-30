export interface Course {
  id: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Level {
  id: string;
  nameEn: string;
  nameAr: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InternalRatings {
  grammar: number;     // 1-5
  speaking: number;    // 1-5
  listening: number;   // 1-5
  pronunciation: number; // 1-5
  confidence: number;  // 1-5
}

export interface StudentFeedback {
  summary: string;
  strengths: string[];
  improvementAreas: string[];
}

export interface InternalFeedback {
  ratings: InternalRatings;
  notes: string;
}

export interface Evaluation {
  id: string;
  sessionId: string;
  courseId: string;
  levelId: string;
  studentFeedback: StudentFeedback;
  internalFeedback: InternalFeedback;
  evaluatedBy: string; // teacher id
  evaluatedAt: string;
  createdAt: string;
  updatedAt: string;
}
