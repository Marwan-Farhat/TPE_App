export type SlotType = 'lectures' | 'oralPlacementTests';
export type SlotVenue = 'online' | 'onsite';
export type SlotStatus = 'active' | 'deactivated' | 'archived' | 'deleted';

export type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
];

export interface SlotDaySchedule {
  day: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  duration: number;  // in minutes, auto-calculated
}

export interface TimeSlot {
  id: string;
  type: SlotType;
  venue: SlotVenue;
  label: string;
  color: string;
  status: SlotStatus;
  days: SlotDaySchedule[];
  // Placement test specific
  singleTestDuration?: number; // in minutes
  numberOfTests?: number;      // auto-calculated
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Form data for creating/editing
export interface TimeSlotFormData {
  type: SlotType | '';
  venue: SlotVenue | '';
  label: string;
  color: string;
  days: SlotDaySchedule[];
  selectedDays: DayOfWeek[];
  // Placement test
  singleTestDuration: number;
  // Placement test - single day
  placementDay: DayOfWeek | '';
  placementStartTime: string;
  placementEndTime: string;
}

export const SLOT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E11D48', '#7C3AED', '#0EA5E9', '#22C55E',
];
