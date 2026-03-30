import { Course } from '@/types/evaluation';

const STORAGE_KEY = 'proenglish_courses';

const getAll = (): Course[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  // Seed default courses
  const defaults: Course[] = [
    { id: 'course-1', nameEn: '3in1 Program', nameAr: 'برنامج 3in1', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'course-2', nameEn: '2in1 Course', nameAr: 'كورس 2in1', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'course-3', nameEn: 'Teens Course', nameAr: 'كورس المراهقين', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'course-4', nameEn: 'VIP Course', nameAr: 'كورس VIP', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'course-5', nameEn: 'General English', nameAr: 'إنجليزي عام', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'course-6', nameEn: 'Business English', nameAr: 'إنجليزي أعمال', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

const save = (courses: Course[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));

const create = (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course => {
  const all = getAll();
  const course: Course = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  all.push(course);
  save(all);
  return course;
};

const update = (id: string, data: Partial<Course>): Course | null => {
  const all = getAll();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  save(all);
  return all[idx];
};

const remove = (id: string): boolean => {
  const all = getAll();
  const filtered = all.filter(c => c.id !== id);
  if (filtered.length === all.length) return false;
  save(filtered);
  return true;
};

const getById = (id: string): Course | undefined => getAll().find(c => c.id === id);

export const courseService = { getAll, create, update, remove, getById };
