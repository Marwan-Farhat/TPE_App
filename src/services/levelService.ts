import { Level } from '@/types/evaluation';

const STORAGE_KEY = 'proenglish_levels';

const getAll = (): Level[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  const defaults: Level[] = [
    { id: 'level-1', nameEn: 'Beginner', nameAr: 'مبتدئ', order: 1, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'level-2', nameEn: 'Elementary', nameAr: 'أساسي', order: 2, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'level-3', nameEn: 'Pre-Intermediate', nameAr: 'قبل المتوسط', order: 3, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'level-4', nameEn: 'Intermediate', nameAr: 'متوسط', order: 4, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'level-5', nameEn: 'Upper-Intermediate', nameAr: 'فوق المتوسط', order: 5, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'level-6', nameEn: 'Advanced', nameAr: 'متقدم', order: 6, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

const save = (levels: Level[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));

const create = (data: Omit<Level, 'id' | 'createdAt' | 'updatedAt'>): Level => {
  const all = getAll();
  const level: Level = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  all.push(level);
  save(all);
  return level;
};

const update = (id: string, data: Partial<Level>): Level | null => {
  const all = getAll();
  const idx = all.findIndex(l => l.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  save(all);
  return all[idx];
};

const remove = (id: string): boolean => {
  const all = getAll();
  const filtered = all.filter(l => l.id !== id);
  if (filtered.length === all.length) return false;
  save(filtered);
  return true;
};

const getById = (id: string): Level | undefined => getAll().find(l => l.id === id);

export const levelService = { getAll, create, update, remove, getById };
