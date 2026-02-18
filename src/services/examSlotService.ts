import { ExamSlot, BulkSlotFormData, SingleSlotFormData } from '@/types/examSlot';
import { oralTestTypeService } from './oralTestTypeService';
import { format, addMinutes, parse, eachDayOfInterval, getDay } from 'date-fns';

const STORAGE_KEY = 'proenglish_exam_slots';

const getAll = (): ExamSlot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const save = (slots: ExamSlot[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
};

const getByDate = (date: string): ExamSlot[] => {
  return getAll().filter((s) => s.date === date);
};

const getDatesWithSlots = (): string[] => {
  const all = getAll();
  return [...new Set(all.map((s) => s.date))];
};

const getByTeacherAndDate = (teacherId: string, date: string): ExamSlot[] => {
  return getAll().filter((s) => s.teacherId === teacherId && s.date === date);
};

/**
 * Check if time range aligns with duration
 */
const validateTimeRange = (startTime: string, endTime: string, duration: number): { valid: boolean; slotCount: number } => {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (totalMinutes <= 0) return { valid: false, slotCount: 0 };
  const slotCount = totalMinutes / duration;
  return { valid: Number.isInteger(slotCount) && slotCount > 0, slotCount: Math.floor(slotCount) };
};

/**
 * Check for overlapping slots
 */
const hasOverlap = (teacherId: string, date: string, startTime: string, endTime: string, excludeId?: string): boolean => {
  const existing = getByTeacherAndDate(teacherId, date).filter((s) => !excludeId || s.id !== excludeId);
  const newStart = parse(startTime, 'HH:mm', new Date()).getTime();
  const newEnd = parse(endTime, 'HH:mm', new Date()).getTime();

  return existing.some((slot) => {
    const slotStart = parse(slot.startTime, 'HH:mm', new Date()).getTime();
    const slotEnd = parse(slot.endTime, 'HH:mm', new Date()).getTime();
    return newStart < slotEnd && newEnd > slotStart;
  });
};

/**
 * Generate individual slots from a work time range
 */
const generateSlotsFromRange = (
  startTime: string,
  endTime: string,
  duration: number,
): { startTime: string; endTime: string }[] => {
  const slots: { startTime: string; endTime: string }[] = [];
  let current = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());

  while (current.getTime() < end.getTime()) {
    const slotEnd = addMinutes(current, duration);
    if (slotEnd.getTime() > end.getTime()) break;
    slots.push({
      startTime: format(current, 'HH:mm'),
      endTime: format(slotEnd, 'HH:mm'),
    });
    current = slotEnd;
  }
  return slots;
};

/**
 * Create a single slot for a specific date
 */
const createSingle = (
  data: SingleSlotFormData,
  date: string,
): { success: boolean; error?: string; slot?: ExamSlot } => {
  const oralTestType = oralTestTypeService.getById(data.oralTestTypeId);
  if (!oralTestType) return { success: false, error: 'invalid_test_type' };
  if (!oralTestType.isActive) return { success: false, error: 'inactive_test_type' };

  const startParsed = parse(data.startTime, 'HH:mm', new Date());
  const endTime = format(addMinutes(startParsed, oralTestType.duration), 'HH:mm');

  // Check overlap
  if (hasOverlap(data.teacherId, date, data.startTime, endTime)) {
    return { success: false, error: 'overlap' };
  }

  // Check not in the past
  const today = format(new Date(), 'yyyy-MM-dd');
  if (date < today) {
    return { success: false, error: 'past_date' };
  }

  const all = getAll();
  const newSlot: ExamSlot = {
    id: crypto.randomUUID(),
    teacherId: data.teacherId,
    teacherName: '', // will be set by caller
    oralTestTypeId: data.oralTestTypeId,
    oralTestTypeName: oralTestType.title,
    date,
    startTime: data.startTime,
    endTime,
    duration: oralTestType.duration,
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newSlot);
  save(all);
  return { success: true, slot: newSlot };
};

/**
 * Create bulk slots across a date range
 */
const createBulk = (
  data: BulkSlotFormData,
  teacherName: string,
): { success: boolean; created: number; errors: string[] } => {
  const oralTestType = oralTestTypeService.getById(data.oralTestTypeId);
  if (!oralTestType) return { success: false, created: 0, errors: ['invalid_test_type'] };
  if (!oralTestType.isActive) return { success: false, created: 0, errors: ['inactive_test_type'] };

  const errors: string[] = [];
  let created = 0;
  const all = getAll();

  // Validate all time ranges first
  for (const range of data.timeRanges) {
    if (range.slotType === 'work') {
      const validation = validateTimeRange(range.startTime, range.endTime, oralTestType.duration);
      if (!validation.valid) {
        errors.push('duration_mismatch');
        return { success: false, created: 0, errors };
      }
    }
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of days) {
    const dayOfWeek = getDay(day);
    if (!data.daysOfWeek.includes(dayOfWeek)) continue;

    const dateStr = format(day, 'yyyy-MM-dd');

    for (const range of data.timeRanges) {
      if (range.slotType !== 'work') continue;

      const slots = generateSlotsFromRange(range.startTime, range.endTime, oralTestType.duration);

      for (const slot of slots) {
        if (hasOverlap(data.teacherId, dateStr, slot.startTime, slot.endTime)) {
          continue; // Skip overlapping slots silently
        }

        const newSlot: ExamSlot = {
          id: crypto.randomUUID(),
          teacherId: data.teacherId,
          teacherName,
          oralTestTypeId: data.oralTestTypeId,
          oralTestTypeName: oralTestType.title,
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: oralTestType.duration,
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        all.push(newSlot);
        created++;
      }
    }
  }

  save(all);
  return { success: created > 0, created, errors };
};

const remove = (id: string): boolean => {
  const all = getAll();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length === all.length) return false;
  save(filtered);
  return true;
};

const removeByTeacherAndDate = (teacherId: string, date: string): number => {
  const all = getAll();
  const filtered = all.filter((s) => !(s.teacherId === teacherId && s.date === date));
  const removed = all.length - filtered.length;
  save(filtered);
  return removed;
};

export const examSlotService = {
  getAll,
  getByDate,
  getDatesWithSlots,
  getByTeacherAndDate,
  validateTimeRange,
  hasOverlap,
  createSingle,
  createBulk,
  remove,
  removeByTeacherAndDate,
};
