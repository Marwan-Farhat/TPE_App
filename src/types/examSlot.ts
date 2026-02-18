export interface ExamSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  oralTestTypeId: string;
  oralTestTypeName: string;
  creationType?: 'bulk' | 'single';
  groupId?: string;
  groupStartDate?: string;
  groupEndDate?: string;
  groupDaysOfWeek?: number[];
  bulkTimeRanges?: TimeRange[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes (from oral test type)
  status: 'available' | 'reserved' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface BulkSlotFormData {
  teacherId: string;
  oralTestTypeId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ...
  timeRanges: TimeRange[];
}

export interface TimeRange {
  id: string;
  startTime: string;
  endTime: string;
  slotType: 'work' | 'break';
}

export interface SingleSlotFormData {
  teacherId: string;
  oralTestTypeId: string;
  startTime: string;
}

export interface ExamSlotGroup {
  id: string;
  teacherId: string;
  teacherName: string;
  oralTestTypeId: string;
  oralTestTypeName: string;
  slotCreationType: 'bulk' | 'single';
  startDate: string;
  endDate: string;
  daysIncluded: number[];
  startTime: string;
  endTime: string;
  timeRanges: TimeRange[];
  slotsCount: number;
}
