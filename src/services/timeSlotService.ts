import { TimeSlot, SlotStatus, SlotType } from '@/types/timeSlot';

const STORAGE_KEY = 'proenglish_time_slots';

const getAll = (): TimeSlot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (slots: TimeSlot[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
};

const getById = (id: string): TimeSlot | undefined => {
  return getAll().find((s) => s.id === id);
};

const getByType = (type: SlotType): TimeSlot[] => {
  return getAll().filter((s) => s.type === type && s.status !== 'deleted');
};

const getActive = (): TimeSlot[] => {
  return getAll().filter((s) => s.status === 'active');
};

const create = (slot: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>): TimeSlot => {
  const all = getAll();
  const newSlot: TimeSlot = {
    ...slot,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newSlot);
  save(all);
  return newSlot;
};

const update = (id: string, updates: Partial<TimeSlot>): TimeSlot | null => {
  const all = getAll();
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
  save(all);
  return all[index];
};

const updateStatus = (id: string, status: SlotStatus): TimeSlot | null => {
  return update(id, { status });
};

const remove = (id: string): boolean => {
  const all = getAll();
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return false;
  all.splice(index, 1);
  save(all);
  return true;
};

export const timeSlotService = {
  getAll,
  getById,
  getByType,
  getActive,
  create,
  update,
  updateStatus,
  remove,
};
