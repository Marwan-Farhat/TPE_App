import { TimeSlot, DayOfWeek } from '@/types/timeSlot';

/**
 * Instructor Matching Service
 * 
 * This is a placeholder service designed for future integration.
 * When creating batches or oral placement tests, this service will:
 * 1. Filter slots by type (lectures → Instructor role, oral tests → PlacementTester role)
 * 2. Match instructors based on:
 *    - Branch association
 *    - Duties / Role
 *    - Working schedule (shifts)
 * 3. Return only available instructors for a given time slot
 * 
 * Currently returns mock data for demonstration purposes.
 */

export interface MatchedInstructor {
  id: string;
  name: string;
  role: 'Instructor' | 'PlacementTester';
  avatarUrl?: string;
  isAvailable: boolean;
}

/**
 * Get available instructors for a time slot
 * This is called later when creating batches or oral tests, NOT during slot creation
 */
export const getAvailableInstructors = (slot: TimeSlot): MatchedInstructor[] => {
  // In production, this would query the database for instructors
  // whose schedules overlap with the slot's days/times,
  // whose branch matches, and whose role matches the slot type
  return [];
};

/**
 * Check if an instructor is available for a specific day/time
 */
export const isInstructorAvailable = (
  instructorId: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string
): boolean => {
  // Placeholder - would check against instructor's schedule
  return true;
};

export const instructorMatchingService = {
  getAvailableInstructors,
  isInstructorAvailable,
};
