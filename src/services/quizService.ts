import { Quiz, QuizFormData } from '@/types/quiz';

const STORAGE_KEY = 'proenglish_quizzes';

const getAll = (): Quiz[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (quizzes: Quiz[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
};

const getById = (id: string): Quiz | undefined => {
  return getAll().find((q) => q.id === id);
};

const getByTemplateId = (templateId: string): Quiz[] => {
  return getAll().filter((q) => q.templateId === templateId);
};

const create = (data: QuizFormData): Quiz => {
  const all = getAll();

  // If setting as current, unset previous current for same template
  if (data.isCurrent && data.templateId) {
    all.forEach((q) => {
      if (q.templateId === data.templateId) q.isCurrent = false;
    });
  }

  const newQuiz: Quiz = {
    ...data,
    id: crypto.randomUUID(),
    totalQuestions: 0,
    questionsStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newQuiz);
  save(all);
  return newQuiz;
};

const update = (id: string, data: Partial<QuizFormData>): Quiz | null => {
  const all = getAll();
  const index = all.findIndex((q) => q.id === id);
  if (index === -1) return null;

  // If setting as current, unset previous current for same template
  if (data.isCurrent) {
    const templateId = data.templateId ?? all[index].templateId;
    if (templateId) {
      all.forEach((q) => {
        if (q.templateId === templateId) q.isCurrent = false;
      });
    }
  }

  all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() };
  save(all);
  return all[index];
};

const toggleActive = (id: string): Quiz | null => {
  const all = getAll();
  const quiz = all.find((q) => q.id === id);
  if (!quiz) return null;

  if (quiz.isActive && quiz.isCurrent) return null; // can't deactivate current

  quiz.isActive = !quiz.isActive;
  quiz.updatedAt = new Date().toISOString();
  save(all);
  return quiz;
};

const toggleCurrent = (id: string): Quiz | null => {
  const all = getAll();
  const quiz = all.find((q) => q.id === id);
  if (!quiz) return null;
  if (quiz.isCurrent) return null; // can't unset current directly
  if (!quiz.isActive) return null; // must be active

  // Unset current for same template
  all.forEach((q) => {
    if (q.templateId === quiz.templateId) q.isCurrent = false;
  });
  quiz.isCurrent = true;
  quiz.updatedAt = new Date().toISOString();
  save(all);
  return quiz;
};

const updateTotalQuestions = (quizId: string, count: number): void => {
  const all = getAll();
  const quiz = all.find((q) => q.id === quizId);
  if (quiz) {
    quiz.totalQuestions = count;
    quiz.updatedAt = new Date().toISOString();
    save(all);
  }
};

const updateQuestionsStatus = (quizId: string, status: 'pending' | 'saved'): void => {
  const all = getAll();
  const quiz = all.find((q) => q.id === quizId);
  if (quiz) {
    quiz.questionsStatus = status;
    quiz.updatedAt = new Date().toISOString();
    save(all);
  }
};

const remove = (id: string): boolean => {
  const all = getAll();
  const quiz = all.find((q) => q.id === id);
  if (!quiz) return false;
  if (quiz.isCurrent) return false;

  const filtered = all.filter((q) => q.id !== id);
  save(filtered);
  return true;
};

export const quizService = {
  getAll,
  getById,
  getByTemplateId,
  create,
  update,
  toggleActive,
  toggleCurrent,
  updateTotalQuestions,
  updateQuestionsStatus,
  remove,
};
