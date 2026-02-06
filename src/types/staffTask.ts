 /**
  * Staff Tasks (Remarks/Tickets) - Type Definitions
  * Internal task management system for client follow-ups
  */
 
 export type TaskUrgency = "normal" | "important" | "critical";
 export type TaskStatus = "pending" | "resolved";
 
 export interface TaskCategory {
   id: string;
  name: string;
   createdAt: string;
 }
 
 export interface TaskNote {
   id: string;
   content: string;
   createdBy: string;
   createdByName: string;
   createdAt: string;
   mentions?: string[];
 }
 
 export interface TaskHistoryEntry {
   id: string;
   action: string;
   actionKey: string; // i18n key for the action
   details?: Record<string, string>;
   performedBy: string;
   performedByName: string;
   performedAt: string;
 }
 
 export interface TaskReminder {
   id: string;
   message: string;
   reminderAt: string;
   createdBy: string;
   isTriggered: boolean;
 }
 
 export interface StaffTask {
   id: string;
   code: string; // Auto-generated unique code like #43017
   
   // Core fields
   title: string;
   description?: string;
   
   // Associations
   clientId: string;
   clientName: string;
   clientCode: string;
   
   // Assignment
   assignedTo: string; // User ID
   assignedToName: string;
   allowReassign: boolean;
   
   // Classification
   categories: string[]; // Category IDs
   urgency: TaskUrgency;
   status: TaskStatus;
   
   // Metadata
   addedBy: string; // User ID
   addedByName: string;
   createdAt: string;
   updatedAt: string;
   resolvedAt?: string;
   resolvedBy?: string;
   
   // Related data
   notes: TaskNote[];
   history: TaskHistoryEntry[];
   reminders: TaskReminder[];
   attachments?: TaskAttachment[];
 }
 
 export interface TaskAttachment {
   id: string;
  clientId?: string; // For client file attachments
   name: string;
   size: number;
   type: string;
  url?: string;
   uploadedBy: string;
   uploadedByName: string;
   uploadedAt: string;
 }
 
 export interface CreateTaskPayload {
   title: string;
   description?: string;
   clientId: string;
   clientName: string;
   clientCode: string;
   assignedTo: string;
   assignedToName: string;
   categories: string[];
   urgency: TaskUrgency;
   allowReassign: boolean;
 }
 
 export interface UpdateTaskPayload {
   title?: string;
   description?: string;
   assignedTo?: string;
   assignedToName?: string;
   categories?: string[];
   urgency?: TaskUrgency;
   allowReassign?: boolean;
 }