export interface WrittenTestResult {
  quizId: string;
  quizTitle: string;
  questions: WrittenTestQuestion[];
  totalScore: number;
  maxScore: number;
  completedAt: string;
}

export interface WrittenTestQuestion {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
}

export interface Session {
  id: string;
  examSlotId: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  oralTestTypeId: string;
  oralTestTypeName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  writtenTestResult?: WrittenTestResult;
  evaluationId?: string;
  cancelRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CancelRequest {
  id: string;
  sessionId: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
