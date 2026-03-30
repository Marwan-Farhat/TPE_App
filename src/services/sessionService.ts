import { Session, CancelRequest } from '@/types/session';
import { Evaluation } from '@/types/evaluation';
import { format, addDays } from 'date-fns';

const SESSIONS_KEY = 'proenglish_sessions';
const CANCEL_REQUESTS_KEY = 'proenglish_cancel_requests';
const EVALUATIONS_KEY = 'proenglish_evaluations';

// ---- Sessions ----
const getAllSessions = (): Session[] => {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults = generateDemoSessions();
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveSessions = (sessions: Session[]) => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

const getSessionById = (id: string): Session | undefined => getAllSessions().find(s => s.id === id);

const getSessionsByTeacher = (teacherId: string): Session[] => getAllSessions().filter(s => s.teacherId === teacherId);

const getSessionsByStudent = (studentId: string): Session[] => getAllSessions().filter(s => s.studentId === studentId);

const updateSession = (id: string, data: Partial<Session>): Session | null => {
  const all = getAllSessions();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  saveSessions(all);
  return all[idx];
};

// ---- Cancel Requests ----
const getAllCancelRequests = (): CancelRequest[] => {
  try {
    const stored = localStorage.getItem(CANCEL_REQUESTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
};

const saveCancelRequests = (reqs: CancelRequest[]) => localStorage.setItem(CANCEL_REQUESTS_KEY, JSON.stringify(reqs));

const createCancelRequest = (data: Omit<CancelRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): CancelRequest => {
  const all = getAllCancelRequests();
  const req: CancelRequest = {
    ...data,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(req);
  saveCancelRequests(all);
  
  // Link to session
  updateSession(data.sessionId, { cancelRequestId: req.id });
  
  return req;
};

const getCancelRequestsByTeacher = (teacherId: string): CancelRequest[] => getAllCancelRequests().filter(r => r.teacherId === teacherId);

const reviewCancelRequest = (id: string, approved: boolean, reviewedBy: string, rejectionReason?: string): CancelRequest | null => {
  const all = getAllCancelRequests();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return null;
  
  all[idx] = {
    ...all[idx],
    status: approved ? 'approved' : 'denied',
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    rejectionReason: approved ? undefined : rejectionReason,
    updatedAt: new Date().toISOString(),
  };
  saveCancelRequests(all);
  
  // If approved, cancel the session
  if (approved) {
    updateSession(all[idx].sessionId, { status: 'cancelled' });
  }
  
  return all[idx];
};

// ---- Evaluations ----
const getAllEvaluations = (): Evaluation[] => {
  try {
    const stored = localStorage.getItem(EVALUATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults = generateDemoEvaluations();
  localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveEvaluations = (evals: Evaluation[]) => localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(evals));

const getEvaluationBySessionId = (sessionId: string): Evaluation | undefined => getAllEvaluations().find(e => e.sessionId === sessionId);

const getEvaluationsByStudent = (studentId: string): Evaluation[] => {
  const sessions = getSessionsByStudent(studentId);
  const evals = getAllEvaluations();
  const sessionIds = new Set(sessions.map(s => s.id));
  return evals.filter(e => sessionIds.has(e.sessionId));
};

const createEvaluation = (data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Evaluation => {
  const all = getAllEvaluations();
  const evaluation: Evaluation = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(evaluation);
  saveEvaluations(all);
  
  // Link to session
  updateSession(data.sessionId, { evaluationId: evaluation.id, status: 'completed' });
  
  return evaluation;
};

// ---- Demo Data Generation ----
function generateDemoSessions(): Session[] {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  
  return [
    // Completed session WITH evaluation (client-001 / Omar Khalid)
    {
      id: 'session-001',
      examSlotId: 'slot-demo-1',
      teacherId: 'teacher-003',
      teacherName: 'Linda Chen',
      studentId: 'client-001',
      studentName: 'Omar Khalid',
      studentEmail: 'student@proenglish.com',
      studentPhone: '+971509012345',
      date: format(twoDaysAgo, 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '10:30',
      duration: 30,
      oralTestTypeId: 'ott-demo-1',
      oralTestTypeName: 'Standard Placement Test',
      status: 'completed',
      evaluationId: 'eval-001',
      writtenTestResult: {
        quizId: 'quiz-demo-1',
        quizTitle: 'Placement Test - General English',
        totalScore: 38,
        maxScore: 50,
        completedAt: format(addDays(today, -3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        questions: [
          { questionText: 'Choose the correct form: She ___ to school every day.', studentAnswer: 'goes', correctAnswer: 'goes', isCorrect: true, points: 5 },
          { questionText: 'Which sentence is correct?', studentAnswer: 'I have been living here since 2020.', correctAnswer: 'I have been living here since 2020.', isCorrect: true, points: 5 },
          { questionText: 'Fill in the blank: If I ___ rich, I would travel the world.', studentAnswer: 'was', correctAnswer: 'were', isCorrect: false, points: 5 },
          { questionText: 'Choose the right word: The movie was very ___.', studentAnswer: 'exciting', correctAnswer: 'exciting', isCorrect: true, points: 5 },
          { questionText: 'Select the correct past participle of "go".', studentAnswer: 'gone', correctAnswer: 'gone', isCorrect: true, points: 5 },
          { questionText: 'What is the opposite of "generous"?', studentAnswer: 'stingy', correctAnswer: 'stingy', isCorrect: true, points: 5 },
          { questionText: 'Choose the correct preposition: She is interested ___ music.', studentAnswer: 'in', correctAnswer: 'in', isCorrect: true, points: 5 },
          { questionText: 'Which word is a noun?', studentAnswer: 'quickly', correctAnswer: 'happiness', isCorrect: false, points: 5 },
          { questionText: 'Complete: By next year, I ___ graduated.', studentAnswer: 'will have', correctAnswer: 'will have', isCorrect: true, points: 5 },
          { questionText: 'Choose the correct sentence:', studentAnswer: 'Neither the cat nor the dogs is here.', correctAnswer: 'Neither the cat nor the dogs are here.', isCorrect: false, points: 5 },
        ],
      },
      createdAt: format(addDays(today, -5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updatedAt: format(twoDaysAgo, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    // Session with NO evaluation yet (client-002 / Layla Ahmed)
    {
      id: 'session-002',
      examSlotId: 'slot-demo-2',
      teacherId: 'teacher-003',
      teacherName: 'Linda Chen',
      studentId: 'client-002',
      studentName: 'Layla Ahmed',
      studentEmail: 'student2@proenglish.com',
      studentPhone: '+971510123456',
      date: format(yesterday, 'yyyy-MM-dd'),
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      oralTestTypeId: 'ott-demo-1',
      oralTestTypeName: 'Standard Placement Test',
      status: 'scheduled',
      writtenTestResult: {
        quizId: 'quiz-demo-1',
        quizTitle: 'Placement Test - General English',
        totalScore: 25,
        maxScore: 50,
        completedAt: format(addDays(today, -2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        questions: [
          { questionText: 'Choose the correct form: She ___ to school every day.', studentAnswer: 'goes', correctAnswer: 'goes', isCorrect: true, points: 5 },
          { questionText: 'Which sentence is correct?', studentAnswer: 'I living here since 2020.', correctAnswer: 'I have been living here since 2020.', isCorrect: false, points: 5 },
          { questionText: 'Fill in the blank: If I ___ rich, I would travel the world.', studentAnswer: 'am', correctAnswer: 'were', isCorrect: false, points: 5 },
          { questionText: 'Choose the right word: The movie was very ___.', studentAnswer: 'exciting', correctAnswer: 'exciting', isCorrect: true, points: 5 },
          { questionText: 'Select the correct past participle of "go".', studentAnswer: 'went', correctAnswer: 'gone', isCorrect: false, points: 5 },
          { questionText: 'What is the opposite of "generous"?', studentAnswer: 'kind', correctAnswer: 'stingy', isCorrect: false, points: 5 },
          { questionText: 'Choose the correct preposition: She is interested ___ music.', studentAnswer: 'in', correctAnswer: 'in', isCorrect: true, points: 5 },
          { questionText: 'Which word is a noun?', studentAnswer: 'happiness', correctAnswer: 'happiness', isCorrect: true, points: 5 },
          { questionText: 'Complete: By next year, I ___ graduated.', studentAnswer: 'will', correctAnswer: 'will have', isCorrect: false, points: 5 },
          { questionText: 'Choose the correct sentence:', studentAnswer: 'Neither the cat nor the dogs are here.', correctAnswer: 'Neither the cat nor the dogs are here.', isCorrect: true, points: 5 },
        ],
      },
      createdAt: format(addDays(today, -3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updatedAt: format(yesterday, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    // Upcoming session
    {
      id: 'session-003',
      examSlotId: 'slot-demo-3',
      teacherId: 'teacher-003',
      teacherName: 'Linda Chen',
      studentId: 'client-001',
      studentName: 'Omar Khalid',
      studentEmail: 'student@proenglish.com',
      studentPhone: '+971509012345',
      date: format(addDays(today, 3), 'yyyy-MM-dd'),
      startTime: '14:00',
      endTime: '14:30',
      duration: 30,
      oralTestTypeId: 'ott-demo-1',
      oralTestTypeName: 'Standard Placement Test',
      status: 'scheduled',
      createdAt: format(today, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updatedAt: format(today, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    // Another session assigned to teacher-004
    {
      id: 'session-004',
      examSlotId: 'slot-demo-4',
      teacherId: 'teacher-004',
      teacherName: 'Dr. Samih Loai',
      studentId: 'client-002',
      studentName: 'Layla Ahmed',
      studentEmail: 'student2@proenglish.com',
      studentPhone: '+971510123456',
      date: format(tomorrow, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '09:30',
      duration: 30,
      oralTestTypeId: 'ott-demo-1',
      oralTestTypeName: 'Standard Placement Test',
      status: 'scheduled',
      createdAt: format(today, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updatedAt: format(today, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
  ];
}

function generateDemoEvaluations(): Evaluation[] {
  return [
    {
      id: 'eval-001',
      sessionId: 'session-001',
      courseId: 'course-1',
      levelId: 'level-4',
      studentFeedback: {
        summary: 'Omar showed strong communication skills and confidence in speaking. He handles everyday conversations well and can express opinions on familiar topics. With more practice on complex grammar structures, he will progress quickly to the next level.',
        strengths: ['Confident speaker', 'Good vocabulary range', 'Natural pronunciation', 'Active listener'],
        improvementAreas: ['Complex grammar', 'Academic writing', 'Conditional sentences'],
      },
      internalFeedback: {
        ratings: { grammar: 3, speaking: 4, listening: 4, pronunciation: 4, confidence: 5 },
        notes: 'Omar is a motivated student with natural talent. Recommend 3in1 Program starting at Intermediate level. He should focus on grammar accuracy. Great candidate for group classes as he motivates others.',
      },
      evaluatedBy: 'teacher-003',
      evaluatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export const sessionService = {
  getAllSessions,
  getSessionById,
  getSessionsByTeacher,
  getSessionsByStudent,
  updateSession,
  getAllCancelRequests,
  createCancelRequest,
  getCancelRequestsByTeacher,
  reviewCancelRequest,
  getAllEvaluations,
  getEvaluationBySessionId,
  getEvaluationsByStudent,
  createEvaluation,
};
