import { Question, QuestionFormData } from '@/types/question';

const STORAGE_KEY = 'proenglish_questions';

const getAll = (): Question[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (questions: Question[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
};

const getById = (id: string): Question | undefined => {
  return getAll().find((q) => q.id === id);
};

const getByQuizId = (quizId: string): Question[] => {
  return getAll()
    .filter((q) => q.quizId === quizId)
    .sort((a, b) => a.order - b.order);
};

const create = (data: QuestionFormData): Question => {
  const all = getAll();
  const newQuestion: Question = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newQuestion);
  save(all);
  return newQuestion;
};

const update = (id: string, data: Partial<QuestionFormData>): Question | null => {
  const all = getAll();
  const index = all.findIndex((q) => q.id === id);
  if (index === -1) return null;

  all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() };
  save(all);
  return all[index];
};

const remove = (id: string): boolean => {
  const all = getAll();
  const filtered = all.filter((q) => q.id !== id);
  if (filtered.length === all.length) return false;
  save(filtered);
  return true;
};

const countByQuizId = (quizId: string): number => {
  return getAll().filter((q) => q.quizId === quizId).length;
};

export const questionService = {
  getAll,
  getById,
  getByQuizId,
  create,
  update,
  remove,
  countByQuizId,
};
