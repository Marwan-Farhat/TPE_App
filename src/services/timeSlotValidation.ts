import { TimeSlotFormData, SlotDaySchedule } from '@/types/timeSlot';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Parse HH:mm time string to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return -1;
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
};

/**
 * Calculate duration in minutes between two time strings
 * Supports cross-midnight ranges (e.g., 15:00 → 00:00 = 9 hours)
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start < 0 || end < 0) return 0;
  if (end <= start) {
    // Cross-midnight: e.g. 15:00 to 00:00
    const totalMinutesInDay = 24 * 60;
    return totalMinutesInDay - start + end;
  }
  return end - start;
};

/**
 * Convert 24h time string (HH:mm) to 12h format (h:mm AM/PM)
 */
export const formatTimeTo12h = (time: string): string => {
  if (!time || !time.includes(':')) return time;
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format minutes to HH:mm display string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes <= 0) return '00:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Calculate number of tests that fit in a time range (supports cross-midnight)
 */
export const calculateNumberOfTests = (
  startTime: string,
  endTime: string,
  singleTestDuration: number
): number => {
  const totalMinutes = calculateDuration(startTime, endTime);
  if (totalMinutes <= 0 || singleTestDuration <= 0) return 0;
  return Math.floor(totalMinutes / singleTestDuration);
};

/**
 * Calculate total weekly duration from all days
 */
export const calculateWeeklyDuration = (days: SlotDaySchedule[]): number => {
  return days.reduce((total, d) => total + (d.duration || 0), 0);
};

/**
 * Validate the entire time slot form
 */
export const validateTimeSlotForm = (data: TimeSlotFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.type) errors.type = 'required';
  if (!data.venue) errors.venue = 'required';
  if (!data.label.trim()) errors.label = 'required';
  if (!data.color) errors.color = 'required';

  if (data.type === 'lectures') {
    // Must have at least one day selected
    if (data.selectedDays.length === 0) {
      errors.days = 'atLeastOneDay';
    }

    // Validate each selected day's times
    data.days.forEach((day) => {
      if (!data.selectedDays.includes(day.day)) return;
      const start = timeToMinutes(day.startTime);
      const end = timeToMinutes(day.endTime);
      if (start < 0) errors[`${day.day}_start`] = 'required';
      if (end < 0) errors[`${day.day}_end`] = 'required';
    // Cross-midnight is allowed, only flag if start === end
      if (start >= 0 && end >= 0 && start === end) {
        errors[`${day.day}_time`] = 'endBeforeStart';
      }
    });
  }

  if (data.type === 'oralPlacementTests') {
    if (!data.placementDay) errors.placementDay = 'required';
    const start = timeToMinutes(data.placementStartTime);
    const end = timeToMinutes(data.placementEndTime);
    if (start < 0) errors.placementStartTime = 'required';
    if (end < 0) errors.placementEndTime = 'required';
    if (start >= 0 && end >= 0 && start === end) {
      errors.placementTime = 'endBeforeStart';
    }
    if (data.singleTestDuration <= 0) {
      errors.singleTestDuration = 'required';
    }
    if (start >= 0 && end >= 0 && start !== end && data.singleTestDuration > 0) {
      const totalMinutes = end > start ? end - start : (24 * 60) - start + end;
      if (totalMinutes < data.singleTestDuration) {
        errors.testFit = 'doesNotFit';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
