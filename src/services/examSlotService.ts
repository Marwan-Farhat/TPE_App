import { ExamSlot, BulkSlotFormData, SingleSlotFormData, ExamSlotGroup } from '@/types/examSlot';
import { oralTestTypeService } from './oralTestTypeService';
import { format, addMinutes, parse, eachDayOfInterval, getDay } from 'date-fns';

const STORAGE_KEY = 'proenglish_exam_slots';

const toNormalizedSlot = (slot: ExamSlot): ExamSlot => {
  const groupId = slot.groupId ?? slot.id;
  const groupStartDate = slot.groupStartDate ?? slot.date;
  const groupEndDate = slot.groupEndDate ?? slot.date;
  const daysIncluded = slot.groupDaysOfWeek ?? [new Date(`${slot.date}T00:00:00`).getDay()];

  return {
    ...slot,
    creationType: slot.creationType ?? 'single',
    groupId,
    groupStartDate,
    groupEndDate,
    groupDaysOfWeek: daysIncluded,
  };
};

const getGroupKey = (slot: ExamSlot): string => slot.groupId ?? slot.id;

const hasOverlapInSlots = (
  slots: ExamSlot[],
  teacherId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
): boolean => {
  const existing = slots.filter((s) => s.teacherId === teacherId && s.date === date && (!excludeId || s.id !== excludeId));
  const newStart = parse(startTime, 'HH:mm', new Date()).getTime();
  const newEnd = parse(endTime, 'HH:mm', new Date()).getTime();

  return existing.some((slot) => {
    const slotStart = parse(slot.startTime, 'HH:mm', new Date()).getTime();
    const slotEnd = parse(slot.endTime, 'HH:mm', new Date()).getTime();
    return newStart < slotEnd && newEnd > slotStart;
  });
};

const getAll = (): ExamSlot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const slots = stored ? (JSON.parse(stored) as ExamSlot[]) : [];
    return slots.map(toNormalizedSlot);
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

const getGroups = (): ExamSlotGroup[] => {
  const all = getAll();
  const grouped = new Map<string, ExamSlot[]>();

  for (const slot of all) {
    const key = getGroupKey(slot);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(slot);
  }

  return Array.from(grouped.entries()).map(([groupId, slots]) => {
    const sortedByDateTime = [...slots].sort((a, b) => {
      const aDt = new Date(`${a.date}T${a.startTime}:00`).getTime();
      const bDt = new Date(`${b.date}T${b.startTime}:00`).getTime();
      return aDt - bDt;
    });
    const first = sortedByDateTime[0];
    const last = sortedByDateTime[sortedByDateTime.length - 1];
    const daysIncluded = Array.from(
      new Set(
        (first.groupDaysOfWeek && first.groupDaysOfWeek.length > 0)
          ? first.groupDaysOfWeek
          : sortedByDateTime.map((slot) => new Date(`${slot.date}T00:00:00`).getDay()),
      ),
    ).sort((a, b) => a - b);

    return {
      id: groupId,
      teacherId: first.teacherId,
      teacherName: first.teacherName,
      oralTestTypeId: first.oralTestTypeId,
      oralTestTypeName: first.oralTestTypeName,
      slotCreationType: first.creationType ?? 'single',
      startDate: first.groupStartDate ?? first.date,
      endDate: first.groupEndDate ?? last.date,
      daysIncluded,
      startTime: sortedByDateTime[0].startTime,
      endTime: sortedByDateTime[sortedByDateTime.length - 1].endTime,
      timeRanges: first.bulkTimeRanges && first.bulkTimeRanges.length > 0
        ? first.bulkTimeRanges
        : [
            {
              id: crypto.randomUUID(),
              startTime: sortedByDateTime[0].startTime,
              endTime: sortedByDateTime[sortedByDateTime.length - 1].endTime,
              slotType: 'work',
            },
          ],
      slotsCount: slots.length,
    };
  });
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
  return hasOverlapInSlots(getAll(), teacherId, date, startTime, endTime, excludeId);
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
  teacherName?: string,
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
  const groupId = crypto.randomUUID();
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
  const newSlot: ExamSlot = {
    id: crypto.randomUUID(),
    creationType: 'single',
    groupId,
    groupStartDate: date,
    groupEndDate: date,
    groupDaysOfWeek: [dayOfWeek],
    teacherId: data.teacherId,
    teacherName: teacherName ?? '',
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
  const groupId = crypto.randomUUID();

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
          creationType: 'bulk',
          groupId,
          groupStartDate: data.startDate,
          groupEndDate: data.endDate,
          groupDaysOfWeek: data.daysOfWeek,
          bulkTimeRanges: data.timeRanges,
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

const removeGroup = (groupId: string): number => {
  const all = getAll();
  const filtered = all.filter((s) => getGroupKey(s) !== groupId);
  const removed = all.length - filtered.length;
  save(filtered);
  return removed;
};

const removeByTeacherAndDate = (teacherId: string, date: string): number => {
  const all = getAll();
  const filtered = all.filter((s) => !(s.teacherId === teacherId && s.date === date));
  const removed = all.length - filtered.length;
  save(filtered);
  return removed;
};

const updateSingleGroup = (
  groupId: string,
  data: SingleSlotFormData,
  date: string,
  teacherName: string,
): { success: boolean; error?: string; slot?: ExamSlot } => {
  const snapshot = getAll();
  const remaining = snapshot.filter((slot) => getGroupKey(slot) !== groupId);

  const oralTestType = oralTestTypeService.getById(data.oralTestTypeId);
  if (!oralTestType) return { success: false, error: 'invalid_test_type' };
  if (!oralTestType.isActive) return { success: false, error: 'inactive_test_type' };

  const startParsed = parse(data.startTime, 'HH:mm', new Date());
  const endTime = format(addMinutes(startParsed, oralTestType.duration), 'HH:mm');

  if (hasOverlapInSlots(remaining, data.teacherId, date, data.startTime, endTime)) {
    return { success: false, error: 'overlap' };
  }

  save(remaining);
  const result = createSingle(data, date, teacherName);
  if (!result.success) {
    save(snapshot);
  }
  return result;
};

const updateBulkGroup = (
  groupId: string,
  data: BulkSlotFormData,
  teacherName: string,
): { success: boolean; created: number; errors: string[] } => {
  const snapshot = getAll();
  const remaining = snapshot.filter((slot) => getGroupKey(slot) !== groupId);
  save(remaining);
  const result = createBulk(data, teacherName);
  if (!result.success) {
    save(snapshot);
  }
  return result;
};

export const examSlotService = {
  getAll,
  getByDate,
  getDatesWithSlots,
  getByTeacherAndDate,
  getGroups,
  validateTimeRange,
  hasOverlap,
  createSingle,
  createBulk,
  updateSingleGroup,
  updateBulkGroup,
  remove,
  removeGroup,
  removeByTeacherAndDate,
};
