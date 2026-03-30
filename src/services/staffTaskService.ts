 /**
  * Staff Task Service - Abstraction layer for staff task operations
  * Uses localStorage for persistence in local development
  * Designed for easy migration to real APIs
  */
 
 import {
   StaffTask,
   TaskCategory,
   TaskNote,
   TaskHistoryEntry,
   TaskReminder,
   TaskAttachment,
   CreateTaskPayload,
   UpdateTaskPayload,
   TaskStatus,
   TaskUrgency,
 } from "@/types/staffTask";
 
 // ================================
 // STORAGE KEYS
 // ================================
 const STORAGE_KEYS = {
   TASKS: "proenglish_staff_tasks",
   CATEGORIES: "proenglish_task_categories",
 };
 
 // ================================
 // DEFAULT CATEGORIES
 // ================================
const CATEGORIES_VERSION = "v2"; // Increment to force reset categories

const DEFAULT_CATEGORIES: TaskCategory[] = [
  { id: "cat-001", name: "إستكمال ملف عميل", createdAt: new Date().toISOString() },
  { id: "cat-002", name: "رد عملية دفع لعميل", createdAt: new Date().toISOString() },
  { id: "cat-003", name: "مطالبة عميل بالدفع", createdAt: new Date().toISOString() },
  { id: "cat-004", name: "طلب تسكين كلاس", createdAt: new Date().toISOString() },
  { id: "cat-005", name: "مبالغ مستحقة", createdAt: new Date().toISOString() },
  { id: "cat-006", name: "إسترجاع مدفوعات", createdAt: new Date().toISOString() },
  { id: "cat-007", name: "ملف غير كامل", createdAt: new Date().toISOString() },
  { id: "cat-008", name: "مهام الإتصال / التواصل", createdAt: new Date().toISOString() },
  { id: "cat-009", name: "بانتظار الحصول على شهادة", createdAt: new Date().toISOString() },
  { id: "cat-010", name: "شكوي عن موظف", createdAt: new Date().toISOString() },
  { id: "cat-011", name: "شكوي عن الكوتش", createdAt: new Date().toISOString() },
  { id: "cat-012", name: "شكوي عن المواعيد", createdAt: new Date().toISOString() },
  { id: "cat-013", name: "خصم رصيد", createdAt: new Date().toISOString() },
  { id: "cat-014", name: "استعلام عن الرصيد", createdAt: new Date().toISOString() },
  { id: "cat-015", name: "طلب اعادة الاختبار", createdAt: new Date().toISOString() },
  { id: "cat-016", name: "اعادة المستوى", createdAt: new Date().toISOString() },
  { id: "cat-017", name: "سيلز- معلومات خاطئة", createdAt: new Date().toISOString() },
  { id: "cat-018", name: "شكوي عن الماتريال", createdAt: new Date().toISOString() },
  { id: "cat-019", name: "تحديد مستوي", createdAt: new Date().toISOString() },
  { id: "cat-020", name: "طلب توقف الكورس", createdAt: new Date().toISOString() },
  { id: "cat-021", name: "تقييم مستوي خاطئ", createdAt: new Date().toISOString() },
  { id: "cat-022", name: "تحويل", createdAt: new Date().toISOString() },
  { id: "cat-023", name: "طلب تعويض", createdAt: new Date().toISOString() },
  { id: "cat-024", name: "استفسار", createdAt: new Date().toISOString() },
  { id: "cat-025", name: "سيلز- بحاجة لسداد القسط", createdAt: new Date().toISOString() },
  { id: "cat-026", name: "سيلز- بيانات غير كاملة", createdAt: new Date().toISOString() },
  { id: "cat-027", name: "تم سداد الحجز", createdAt: new Date().toISOString() },
  { id: "cat-028", name: "شكوي عن الانستراكتور", createdAt: new Date().toISOString() },
  { id: "cat-029", name: "مشكلة تقنية", createdAt: new Date().toISOString() },
  { id: "cat-030", name: "طلب تاجيل", createdAt: new Date().toISOString() },
  { id: "cat-031", name: "سيلز- طلب تجديد", createdAt: new Date().toISOString() },
];
 
 // ================================
 // STORAGE HELPERS
 // ================================
 const getStoredData = <T,>(key: string, defaultData: T): T => {
   try {
     const stored = localStorage.getItem(key);
     if (stored) {
       return JSON.parse(stored) as T;
     }
   } catch (error) {
     console.error(`Error reading from localStorage (${key}):`, error);
   }
   return defaultData;
 };
 
 const setStoredData = <T,>(key: string, data: T): void => {
   try {
     localStorage.setItem(key, JSON.stringify(data));
   } catch (error) {
     console.error(`Error writing to localStorage (${key}):`, error);
   }
 };
 
 // ================================
 // INITIALIZE DATA
 // ================================
 const initializeTasks = (): StaffTask[] => {
   return getStoredData<StaffTask[]>(STORAGE_KEYS.TASKS, []);
 };
 
 const initializeCategories = (): TaskCategory[] => {
  // Check version to force reset if categories have been updated
  const storedVersion = localStorage.getItem(STORAGE_KEYS.CATEGORIES + "_version");
  if (storedVersion !== CATEGORIES_VERSION) {
    // Reset to new default categories
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES + "_version", CATEGORIES_VERSION);
    return DEFAULT_CATEGORIES;
  }
  return getStoredData<TaskCategory[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
 };
 
 // In-memory cache
 let tasks: StaffTask[] = initializeTasks();
 let categories: TaskCategory[] = initializeCategories();
 
 // ================================
 // SYNC HELPERS
 // ================================
 const saveTasks = () => {
   setStoredData(STORAGE_KEYS.TASKS, tasks);
 };
 
 const saveCategories = () => {
   setStoredData(STORAGE_KEYS.CATEGORIES, categories);
 };
 
 // ================================
 // UTILITY FUNCTIONS
 // ================================
 const generateTaskCode = (): string => {
   const randomNum = Math.floor(30000 + Math.random() * 20000);
   return `#${randomNum}`;
 };
 
 const generateId = (): string => {
   return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 };
 
 // ================================
 // CATEGORY SERVICE
 // ================================
 export const taskCategoryService = {
   getAll: async (): Promise<TaskCategory[]> => {
     categories = initializeCategories();
     await new Promise((resolve) => setTimeout(resolve, 50));
     return [...categories];
   },
 
  create: async (name: string): Promise<TaskCategory> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
     
     const newCategory: TaskCategory = {
       id: `cat-${Date.now()}`,
      name,
       createdAt: new Date().toISOString(),
     };
     
     categories = initializeCategories();
     categories = [...categories, newCategory];
     saveCategories();
     
     return newCategory;
   },
 
  update: async (id: string, name: string): Promise<TaskCategory | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
     
     categories = initializeCategories();
     const index = categories.findIndex((c) => c.id === id);
     if (index === -1) return null;
     
    categories[index] = { ...categories[index], name };
     saveCategories();
     
     return categories[index];
   },
 
   delete: async (id: string): Promise<boolean> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
     
     categories = initializeCategories();
     const index = categories.findIndex((c) => c.id === id);
     if (index === -1) return false;
     
     categories = categories.filter((c) => c.id !== id);
     saveCategories();
     
     return true;
   },
 };
 
 // ================================
 // STAFF TASK SERVICE
 // ================================
 export const staffTaskService = {
   // Get all tasks
   getAll: async (): Promise<StaffTask[]> => {
     tasks = initializeTasks();
     await new Promise((resolve) => setTimeout(resolve, 100));
     return [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   },
 
   // Get tasks by client ID
   getByClientId: async (clientId: string): Promise<StaffTask[]> => {
     tasks = initializeTasks();
     await new Promise((resolve) => setTimeout(resolve, 50));
     return tasks
       .filter((t) => t.clientId === clientId)
       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   },
 
   // Get tasks assigned to user
   getByAssignee: async (userId: string): Promise<StaffTask[]> => {
     tasks = initializeTasks();
     await new Promise((resolve) => setTimeout(resolve, 50));
     return tasks
       .filter((t) => t.assignedTo === userId && t.status === "pending")
       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   },
 
   // Get task by ID
   getById: async (id: string): Promise<StaffTask | null> => {
     tasks = initializeTasks();
     await new Promise((resolve) => setTimeout(resolve, 50));
     return tasks.find((t) => t.id === id) || null;
   },
 
   // Get task by code
   getByCode: async (code: string): Promise<StaffTask | null> => {
     tasks = initializeTasks();
     await new Promise((resolve) => setTimeout(resolve, 50));
     return tasks.find((t) => t.code === code) || null;
   },
 
   // Create new task
   create: async (
     payload: CreateTaskPayload,
     addedBy: { userId: string; userName: string }
   ): Promise<StaffTask> => {
     await new Promise((resolve) => setTimeout(resolve, 150));
 
     const now = new Date().toISOString();
     const taskCode = generateTaskCode();
 
     const newTask: StaffTask = {
       id: generateId(),
       code: taskCode,
       title: payload.title,
       description: payload.description,
       clientId: payload.clientId,
       clientName: payload.clientName,
       clientCode: payload.clientCode,
       assignedTo: payload.assignedTo,
       assignedToName: payload.assignedToName,
       allowReassign: payload.allowReassign,
       categories: payload.categories,
       urgency: payload.urgency,
       status: "pending",
       addedBy: addedBy.userId,
       addedByName: addedBy.userName,
       createdAt: now,
       updatedAt: now,
       notes: [],
       history: [
         {
           id: generateId(),
           action: `Added, with importance "${payload.urgency}", and was assigned to: ${payload.assignedToName}`,
           actionKey: "taskCreated",
           details: {
             urgency: payload.urgency,
             assignedTo: payload.assignedToName,
           },
           performedBy: addedBy.userId,
           performedByName: addedBy.userName,
           performedAt: now,
         },
       ],
       reminders: [],
   attachments: [],
     };
 
     tasks = initializeTasks();
     tasks = [...tasks, newTask];
     saveTasks();
 
     return newTask;
   },
 
   // Update task
   update: async (
     id: string,
     payload: UpdateTaskPayload,
     updatedBy: { userId: string; userName: string }
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 100));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === id);
     if (index === -1) return null;
 
     const now = new Date().toISOString();
     const oldTask = tasks[index];
 
     // Build history entry for changes
     const changes: string[] = [];
     if (payload.title && payload.title !== oldTask.title) {
       changes.push(`Title changed to "${payload.title}"`);
     }
     if (payload.urgency && payload.urgency !== oldTask.urgency) {
       changes.push(`Urgency changed to "${payload.urgency}"`);
     }
     if (payload.assignedTo && payload.assignedTo !== oldTask.assignedTo) {
       changes.push(`Reassigned to ${payload.assignedToName}`);
     }
 
     const updated: StaffTask = {
       ...oldTask,
       ...payload,
       updatedAt: now,
       history: changes.length > 0
         ? [
             ...oldTask.history,
             {
               id: generateId(),
               action: changes.join(". "),
               actionKey: "taskUpdated",
               details: payload as Record<string, string>,
               performedBy: updatedBy.userId,
               performedByName: updatedBy.userName,
               performedAt: now,
             },
           ]
         : oldTask.history,
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Reassign task
   reassign: async (
     id: string,
     newAssignee: { userId: string; userName: string },
     reassignedBy: { userId: string; userName: string }
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 100));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === id);
     if (index === -1) return null;
 
     const now = new Date().toISOString();
     const oldTask = tasks[index];
 
     const updated: StaffTask = {
       ...oldTask,
       assignedTo: newAssignee.userId,
       assignedToName: newAssignee.userName,
       updatedAt: now,
       history: [
         ...oldTask.history,
         {
           id: generateId(),
           action: `Reassigned from ${oldTask.assignedToName} to ${newAssignee.userName}`,
           actionKey: "taskReassigned",
           details: {
             fromUser: oldTask.assignedToName,
             toUser: newAssignee.userName,
           },
           performedBy: reassignedBy.userId,
           performedByName: reassignedBy.userName,
           performedAt: now,
         },
       ],
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Mark as resolved
   resolve: async (
     id: string,
     resolvedBy: { userId: string; userName: string }
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 100));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === id);
     if (index === -1) return null;
 
     const now = new Date().toISOString();
     const oldTask = tasks[index];
 
     const updated: StaffTask = {
       ...oldTask,
       status: "resolved",
       resolvedAt: now,
       resolvedBy: resolvedBy.userId,
       updatedAt: now,
       history: [
         ...oldTask.history,
         {
           id: generateId(),
           action: "Task marked as resolved",
           actionKey: "taskResolved",
           performedBy: resolvedBy.userId,
           performedByName: resolvedBy.userName,
           performedAt: now,
         },
       ],
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Delete task
   delete: async (id: string): Promise<boolean> => {
     await new Promise((resolve) => setTimeout(resolve, 100));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === id);
     if (index === -1) return false;
 
     tasks = tasks.filter((t) => t.id !== id);
     saveTasks();
 
     return true;
   },
 
   // Add note to task
   addNote: async (
     taskId: string,
     content: string,
     createdBy: { userId: string; userName: string },
     mentions?: string[]
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === taskId);
     if (index === -1) return null;
 
     const now = new Date().toISOString();
     const oldTask = tasks[index];
 
     const newNote: TaskNote = {
       id: generateId(),
       content,
       createdBy: createdBy.userId,
       createdByName: createdBy.userName,
       createdAt: now,
       mentions,
     };
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: now,
       notes: [...oldTask.notes, newNote],
       history: [
         ...oldTask.history,
         {
           id: generateId(),
           action: "Note added",
           actionKey: "noteAdded",
           performedBy: createdBy.userId,
           performedByName: createdBy.userName,
           performedAt: now,
         },
       ],
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Edit note
   editNote: async (
     taskId: string,
     noteId: string,
     content: string
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const taskIndex = tasks.findIndex((t) => t.id === taskId);
     if (taskIndex === -1) return null;
 
     const oldTask = tasks[taskIndex];
     const noteIndex = oldTask.notes.findIndex((n) => n.id === noteId);
     if (noteIndex === -1) return null;
 
     const updatedNotes = [...oldTask.notes];
     updatedNotes[noteIndex] = { ...updatedNotes[noteIndex], content };
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: new Date().toISOString(),
       notes: updatedNotes,
     };
 
     tasks = [...tasks.slice(0, taskIndex), updated, ...tasks.slice(taskIndex + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Delete note
   deleteNote: async (taskId: string, noteId: string): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const taskIndex = tasks.findIndex((t) => t.id === taskId);
     if (taskIndex === -1) return null;
 
     const oldTask = tasks[taskIndex];
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: new Date().toISOString(),
       notes: oldTask.notes.filter((n) => n.id !== noteId),
     };
 
     tasks = [...tasks.slice(0, taskIndex), updated, ...tasks.slice(taskIndex + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Add reminder
   addReminder: async (
     taskId: string,
     message: string,
     reminderAt: string,
     createdBy: string
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === taskId);
     if (index === -1) return null;
 
     const oldTask = tasks[index];
 
     const newReminder: TaskReminder = {
       id: generateId(),
       message,
       reminderAt,
       createdBy,
       isTriggered: false,
     };
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: new Date().toISOString(),
       reminders: [...oldTask.reminders, newReminder],
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Delete reminder
   deleteReminder: async (taskId: string, reminderId: string): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === taskId);
     if (index === -1) return null;
 
     const oldTask = tasks[index];
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: new Date().toISOString(),
       reminders: oldTask.reminders.filter((r) => r.id !== reminderId),
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
   };

// ================================
// CLIENT FILE SERVICE
// ================================
const CLIENT_FILES_STORAGE_KEY = "proenglish_client_files";
const CLIENT_FILE_DATA_KEY = "proenglish_client_file_data";

export const clientFileService = {
  getByClientId(clientId: string): TaskAttachment[] {
    try {
      const stored = localStorage.getItem(CLIENT_FILES_STORAGE_KEY);
      const all: TaskAttachment[] = stored ? JSON.parse(stored) : [];
      return all.filter((a) => a.clientId === clientId);
    } catch (error) {
      console.error("Error reading client files:", error);
      return [];
    }
  },

  addFile(clientId: string, file: File, uploadedBy: string, uploadedByName: string): TaskAttachment {
    const stored = localStorage.getItem(CLIENT_FILES_STORAGE_KEY);
    const all: TaskAttachment[] = stored ? JSON.parse(stored) : [];

    const newAttachment: TaskAttachment = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId: clientId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      uploadedByName,
    };

    // Store file content as base64
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileData = localStorage.getItem(CLIENT_FILE_DATA_KEY) || "{}";
        const data = JSON.parse(fileData);
        data[newAttachment.id] = reader.result;
        localStorage.setItem(CLIENT_FILE_DATA_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Error storing file data:", error);
      }
    };
    reader.readAsDataURL(file);

    all.push(newAttachment);
    localStorage.setItem(CLIENT_FILES_STORAGE_KEY, JSON.stringify(all));
    return newAttachment;
  },

  deleteFile(fileId: string): boolean {
    try {
      const stored = localStorage.getItem(CLIENT_FILES_STORAGE_KEY);
      if (!stored) return false;

      const all: TaskAttachment[] = JSON.parse(stored);
      const filtered = all.filter((a) => a.id !== fileId);
      localStorage.setItem(CLIENT_FILES_STORAGE_KEY, JSON.stringify(filtered));

      // Remove file data
      const fileData = localStorage.getItem(CLIENT_FILE_DATA_KEY) || "{}";
      const data = JSON.parse(fileData);
      delete data[fileId];
      localStorage.setItem(CLIENT_FILE_DATA_KEY, JSON.stringify(data));

      return true;
    } catch (error) {
      console.error("Error deleting client file:", error);
      return false;
    }
  },

  getFileData(fileId: string): string | null {
    try {
      const fileData = localStorage.getItem(CLIENT_FILE_DATA_KEY) || "{}";
      const data = JSON.parse(fileData);
      return data[fileId] || null;
    } catch (error) {
      console.error("Error reading file data:", error);
      return null;
    }
  },

  getTotalFilesSize(clientId: string): number {
    const files = this.getByClientId(clientId);
    return files.reduce((total, file) => total + file.size, 0);
  },
};
 
 // ================================
 // TASK TIMELINE SERVICE (for client timeline integration)
 // ================================
 const TIMELINE_STORAGE_KEY = "proenglish_client_timeline_events";
 
 export interface TimelineEvent {
   id: string;
   clientId: string;
   type: "task" | "tag" | "payment" | "batch" | "status";
   title: string;
   description?: string;
   performedBy: string;
   timestamp: string;
   relativeTime?: string;
   taskId?: string;
   taskCode?: string;
 }
 
 const getTimelineEvents = (): TimelineEvent[] => {
   try {
     const stored = localStorage.getItem(TIMELINE_STORAGE_KEY);
     if (stored) {
       return JSON.parse(stored) as TimelineEvent[];
     }
   } catch (error) {
     console.error("Error reading timeline events:", error);
   }
   return [];
 };
 
 const saveTimelineEvents = (events: TimelineEvent[]): void => {
   try {
     localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(events));
   } catch (error) {
     console.error("Error saving timeline events:", error);
   }
 };
 
 export const taskTimelineService = {
   // Get events for a specific client
   getByClientId: async (clientId: string): Promise<TimelineEvent[]> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
     const events = getTimelineEvents();
     return events
       .filter((e) => e.clientId === clientId)
       .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
   },
 
   // Add a task-related timeline event
   addTaskEvent: async (
     clientId: string,
     eventType: "created" | "deleted" | "reassigned" | "resolved",
     taskCode: string,
     taskTitle: string,
     performedByName: string,
     taskId?: string,
     details?: { assignedTo?: string; fromUser?: string; toUser?: string }
   ): Promise<TimelineEvent> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     const now = new Date().toISOString();
     let title = "";
     let description = "";
 
     switch (eventType) {
       case "created":
         title = `New remark added: (${taskCode}) ${taskTitle}. Is assigned to: ${details?.assignedTo || "N/A"}`;
         break;
       case "deleted":
         title = `Task ${taskCode} was deleted. (${taskTitle})`;
         break;
       case "reassigned":
         title = `Task ${taskCode} was reassigned from ${details?.fromUser} to ${details?.toUser}. (${taskTitle})`;
         break;
       case "resolved":
         title = `Task ${taskCode} was marked as resolved. (${taskTitle})`;
         break;
     }
 
     const event: TimelineEvent = {
       id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
       clientId,
       type: "task",
       title,
       description,
       performedBy: performedByName,
       timestamp: now,
       taskId,
       taskCode,
     };
 
     const events = getTimelineEvents();
     events.push(event);
     saveTimelineEvents(events);
 
     return event;
   },
 
   // Delete events for a task
   deleteByTaskId: async (taskId: string): Promise<void> => {
     const events = getTimelineEvents();
     saveTimelineEvents(events.filter((e) => e.taskId !== taskId));
   },
 };
 
 // ================================
 // ATTACHMENT SERVICE
 // ================================
 export const taskAttachmentService = {
   // Add attachment to task
   addAttachment: async (
     taskId: string,
     file: { name: string; size: number; type: string; url: string },
     uploadedBy: { userId: string; userName: string }
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === taskId);
     if (index === -1) return null;
 
     const now = new Date().toISOString();
     const oldTask = tasks[index];
 
     const newAttachment: TaskAttachment = {
       id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
       name: file.name,
       size: file.size,
       type: file.type,
       url: file.url,
       uploadedBy: uploadedBy.userId,
       uploadedByName: uploadedBy.userName,
       uploadedAt: now,
     };
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: now,
       attachments: [...(oldTask.attachments || []), newAttachment],
       history: [
         ...oldTask.history,
         {
           id: `hist-${Date.now()}`,
           action: `Attachment "${file.name}" added`,
           actionKey: "attachmentAdded",
           performedBy: uploadedBy.userId,
           performedByName: uploadedBy.userName,
           performedAt: now,
         },
       ],
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 
   // Delete attachment
   deleteAttachment: async (
     taskId: string,
     attachmentId: string,
     deletedBy: { userId: string; userName: string }
   ): Promise<StaffTask | null> => {
     await new Promise((resolve) => setTimeout(resolve, 50));
 
     tasks = initializeTasks();
     const index = tasks.findIndex((t) => t.id === taskId);
     if (index === -1) return null;
 
     const now = new Date().toISOString();
     const oldTask = tasks[index];
     const attachment = oldTask.attachments?.find((a) => a.id === attachmentId);
 
     const updated: StaffTask = {
       ...oldTask,
       updatedAt: now,
       attachments: (oldTask.attachments || []).filter((a) => a.id !== attachmentId),
       history: [
         ...oldTask.history,
         {
           id: `hist-${Date.now()}`,
           action: `Attachment "${attachment?.name || "unknown"}" deleted`,
           actionKey: "attachmentDeleted",
           performedBy: deletedBy.userId,
           performedByName: deletedBy.userName,
           performedAt: now,
         },
       ],
     };
 
     tasks = [...tasks.slice(0, index), updated, ...tasks.slice(index + 1)];
     saveTasks();
 
     return updated;
   },
 };