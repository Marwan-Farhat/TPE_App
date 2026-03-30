import { OralTestType, OralTestTypeFormData } from '@/types/oralTestType';

const STORAGE_KEY = 'proenglish_oral_test_types';

const getAll = (): OralTestType[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (items: OralTestType[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const getById = (id: string): OralTestType | undefined => {
  return getAll().find((t) => t.id === id);
};

const getActive = (): OralTestType[] => {
  return getAll().filter((t) => t.isActive);
};

const create = (data: OralTestTypeFormData): OralTestType => {
  const all = getAll();
  const newItem: OralTestType = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newItem);
  save(all);
  return newItem;
};

const update = (id: string, data: Partial<OralTestTypeFormData>): OralTestType | null => {
  const all = getAll();
  const index = all.findIndex((t) => t.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() };
  save(all);
  return all[index];
};

const toggleActive = (id: string): OralTestType | null => {
  const all = getAll();
  const item = all.find((t) => t.id === id);
  if (!item) return null;
  item.isActive = !item.isActive;
  item.updatedAt = new Date().toISOString();
  save(all);
  return item;
};

const remove = (id: string): boolean => {
  const all = getAll();
  const filtered = all.filter((t) => t.id !== id);
  if (filtered.length === all.length) return false;
  save(filtered);
  return true;
};

export const oralTestTypeService = {
  getAll,
  getById,
  getActive,
  create,
  update,
  toggleActive,
  remove,
};
