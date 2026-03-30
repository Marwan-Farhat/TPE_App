/**
 * Client Service - Abstraction layer for client data operations
 * Uses localStorage for persistence in local development
 * Designed for easy migration to real APIs
 */

import { Client, CreateClientPayload, UpdateClientPayload, ClientStatus } from '@/types/client';
import { ExtraField, ExtraFieldValue, CreateExtraFieldPayload, UpdateExtraFieldPayload } from '@/types/extraField';
import mockUsersData from '@/data/mockUsers.json';
import mockExtraFieldsData from '@/data/mockExtraFields.json';
import mockSystemOptionsData from '@/data/mockSystemOptions.json';

// ================================
// STORAGE KEYS
// ================================
const STORAGE_KEYS = {
  CLIENTS: 'proenglish_clients',
  EXTRA_FIELDS: 'proenglish_extra_fields',
};

// ================================
// STORAGE HELPERS
// ================================
const getStoredData = <T>(key: string, defaultData: T): T => {
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

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

// ================================
// INITIALIZE DATA FROM STORAGE OR DEFAULTS
// ================================
const initializeClients = (): Client[] => {
  return getStoredData<Client[]>(STORAGE_KEYS.CLIENTS, mockUsersData.clients as Client[]);
};

const initializeExtraFields = (): ExtraField[] => {
  const stored = getStoredData<ExtraField[]>(STORAGE_KEYS.EXTRA_FIELDS, mockExtraFieldsData.extraFields as ExtraField[]);
  return stored.map(field => {
    const defaultField = (mockExtraFieldsData.extraFields as ExtraField[]).find(f => f.code === field.code);
    return {
      ...defaultField,
      ...field,
      titleEn: field.titleEn ?? defaultField?.titleEn,
      titleAr: field.titleAr ?? defaultField?.titleAr,
      title: field.title || defaultField?.title || field.titleEn || field.titleAr || '',
    };
  });
};

// In-memory cache (synced with localStorage)
let clients: Client[] = initializeClients();
let extraFields: ExtraField[] = initializeExtraFields();

// ================================
// SYNC HELPERS
// ================================
const saveClients = () => {
  setStoredData(STORAGE_KEYS.CLIENTS, clients);
};

const saveExtraFields = () => {
  setStoredData(STORAGE_KEYS.EXTRA_FIELDS, extraFields);
};

// ================================
// UTILITY FUNCTIONS
// ================================

const generateClientCode = (): string => {
  const prefix = 'C-';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomNum}`;
};

const generatePassword = (length: number = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateUniqueId = (): string => {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ================================
// VALIDATION FUNCTIONS
// ================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Allow digits, spaces, dashes, plus sign, and parentheses
  const phoneRegex = /^[\d\s\-+()]{8,20}$/;
  return phoneRegex.test(phone);
};

export const validateClientName = (name: string): boolean => {
  // Allow Arabic, English, spaces - min 2 chars
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{2,100}$/;
  return nameRegex.test(name.trim());
};

// ================================
// CLIENT CRUD OPERATIONS
// ================================

export const clientService = {
  // Get all clients
  getAll: async (): Promise<Client[]> => {
    // Refresh from localStorage
    clients = initializeClients();
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...clients];
  },

  // Get client by ID
  getById: async (id: string): Promise<Client | null> => {
    clients = initializeClients();
    await new Promise(resolve => setTimeout(resolve, 50));
    return clients.find(c => c.id === id) || null;
  },

  // Search clients by name, phone, or email
  search: async (query: string): Promise<Client[]> => {
    clients = initializeClients();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!query.trim()) {
      return [...clients];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    return clients.filter(c => 
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.phoneNumber.replace(/[\s\-()]/g, '').includes(normalizedQuery.replace(/[\s\-()]/g, '')) ||
      c.email.toLowerCase().includes(normalizedQuery)
    );
  },

  // Check for duplicate email
  checkDuplicateEmail: async (email: string, excludeId?: string): Promise<boolean> => {
    clients = initializeClients();
    await new Promise(resolve => setTimeout(resolve, 50));
    const normalizedEmail = email.toLowerCase().trim();
    return clients.some(c => 
      c.email.toLowerCase() === normalizedEmail && c.id !== excludeId
    );
  },

  // Check for duplicate phone
  checkDuplicatePhone: async (phone: string, excludeId?: string): Promise<boolean> => {
    clients = initializeClients();
    await new Promise(resolve => setTimeout(resolve, 50));
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');
    return clients.some(c => 
      c.phoneNumber.replace(/[\s\-()]/g, '') === normalizedPhone && c.id !== excludeId
    );
  },

  // Validate client data
  validate: async (data: Partial<CreateClientPayload>, excludeId?: string): Promise<ValidationResult> => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!data.name || !validateClientName(data.name)) {
      errors.name = 'Please enter a valid name (Arabic or English letters only)';
    }

    // Email validation
    if (!data.email || !validateEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      const isDuplicate = await clientService.checkDuplicateEmail(data.email, excludeId);
      if (isDuplicate) {
        errors.email = 'This email is already registered';
      }
    }

    // Phone validation
    if (!data.phoneNumber || !validatePhoneNumber(data.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    } else {
      const isDuplicate = await clientService.checkDuplicatePhone(data.phoneNumber, excludeId);
      if (isDuplicate) {
        errors.phoneNumber = 'This phone number is already registered';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Create new client
  create: async (
    payload: CreateClientPayload & Partial<Client>,
    addedBy: { userId: string; role: string; interface: string },
    createAccount: boolean = false
  ): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const now = new Date().toISOString();
    const clientCode = generateClientCode();

    const newClient: Client = {
      // System data
      id: clientCode,
      createdAt: now,
      updatedAt: now,
      addedBy,

      // Personal info (required)
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      email: payload.email,

      // Personal info (optional)
      jobTitle: payload.jobTitle,
      age: payload.age,
      gender: payload.gender,
      city: payload.city,
      country: payload.country,
      guardianNumber: payload.guardianNumber,

      // Product data
      currentPath: payload.currentPath,
      pathCost: payload.pathCost,
      paidForPath: payload.paidForPath || 0,
      remainingForPath: payload.remainingForPath || (payload.pathCost || 0),
      pathCourses: payload.pathCourses || [],
      selectedTimeSlots: payload.selectedTimeSlots || [],
      preferredTrainingDays: payload.preferredTrainingDays || [],
      availabilityTime: payload.availabilityTime,
      currentProgram: payload.currentProgram,
      programType: payload.programType,
      source: payload.source,
      tags: payload.tags || [],
      underCompany: payload.underCompany,
      assignedCoordinator: payload.assignedCoordinator,
      totalPaidEver: payload.totalPaidEver || 0,

      // Status
      status: 'New' as ClientStatus,
      statusHistory: [
        {
          status: 'New' as ClientStatus,
          changedAt: now,
          changedBy: addedBy.userId,
        },
      ],

      // Auth fields
      password: createAccount ? generatePassword() : '',
      username: createAccount ? payload.email : undefined,
      isActive: createAccount,
      avatarUrl: '',
      
      // Extra fields (dynamic)
      extraFields: payload.extraFields || {},
    };

    // Refresh from storage, add new client, and save
    clients = initializeClients();
    clients = [...clients, newClient];
    saveClients();
    
    return newClient;
  },

  // Update client
  update: async (id: string, payload: UpdateClientPayload): Promise<Client | null> => {
    await new Promise(resolve => setTimeout(resolve, 150));

    clients = initializeClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated: Client = {
      ...clients[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    clients = [
      ...clients.slice(0, index),
      updated,
      ...clients.slice(index + 1),
    ];

    saveClients();
    return updated;
  },

  // Delete client
  delete: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    clients = initializeClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return false;

    clients = [...clients.slice(0, index), ...clients.slice(index + 1)];
    saveClients();
    return true;
  },
};

// ================================
// EXTRA FIELDS OPERATIONS
// ================================

export const extraFieldService = {
  // Get all extra fields
  getAll: async (): Promise<ExtraField[]> => {
    extraFields = initializeExtraFields();
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...extraFields];
  },

  // Get extra field by ID
  getById: async (id: string): Promise<ExtraField | null> => {
    extraFields = initializeExtraFields();
    await new Promise(resolve => setTimeout(resolve, 30));
    return extraFields.find(f => f.id === id) || null;
  },

  // Check for duplicate code
  checkDuplicateCode: async (code: string, excludeId?: string): Promise<boolean> => {
    extraFields = initializeExtraFields();
    await new Promise(resolve => setTimeout(resolve, 30));
    return extraFields.some(f => 
      f.code.toLowerCase() === code.toLowerCase() && f.id !== excludeId
    );
  },

  // Create new extra field
  create: async (payload: CreateExtraFieldPayload): Promise<ExtraField> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const now = new Date().toISOString();
    const resolvedTitle = payload.title || payload.titleEn || payload.titleAr || '';
    const newField: ExtraField = {
      id: `ef-${Date.now()}`,
      code: payload.code,
      title: resolvedTitle,
      titleEn: payload.titleEn,
      titleAr: payload.titleAr,
      description: payload.description,
      type: payload.type,
      defaultValue: payload.defaultValue,
      options: payload.options,
      isMandatory: payload.isMandatory,
      isSearchable: payload.isSearchable,
      allowOwnerEdit: payload.allowOwnerEdit,
      createdAt: now,
      updatedAt: now,
    };

    extraFields = initializeExtraFields();
    extraFields = [...extraFields, newField];
    saveExtraFields();
    
    return newField;
  },

  // Update extra field
  update: async (id: string, payload: UpdateExtraFieldPayload): Promise<ExtraField | null> => {
    await new Promise(resolve => setTimeout(resolve, 80));

    extraFields = initializeExtraFields();
    const index = extraFields.findIndex(f => f.id === id);
    if (index === -1) return null;

    const resolvedTitle = payload.title || payload.titleEn || payload.titleAr || extraFields[index].title;
    const updated: ExtraField = {
      ...extraFields[index],
      ...payload,
      title: resolvedTitle,
      updatedAt: new Date().toISOString(),
    };

    extraFields = [
      ...extraFields.slice(0, index),
      updated,
      ...extraFields.slice(index + 1),
    ];

    saveExtraFields();
    return updated;
  },

  // Delete extra field
  delete: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    extraFields = initializeExtraFields();
    const index = extraFields.findIndex(f => f.id === id);
    if (index === -1) return false;

    extraFields = [...extraFields.slice(0, index), ...extraFields.slice(index + 1)];
    saveExtraFields();
    return true;
  },

  // Reorder fields
  reorder: async (fromIndex: number, toIndex: number): Promise<ExtraField[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    extraFields = initializeExtraFields();
    const result = [...extraFields];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    extraFields = result;
    saveExtraFields();

    return result;
  },
};

// ================================
// SYSTEM OPTIONS (WITH CUSTOM TAGS SUPPORT)
// ================================

const STORAGE_KEYS_SYSTEM = {
  CUSTOM_TAGS: 'proenglish_custom_tags',
};

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SystemOptions {
  trainingPaths: { id: string; name: string; type: string }[];
  timeSlots: { id: string; label: string; value: string }[];
  tags: Tag[];
  companies: { id: string; name: string }[];
  coordinators: { id: string; name: string; role: string }[];
  trainingDays: string[];
  availabilityOptions: string[];
}

const getCustomTags = (): Tag[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS_SYSTEM.CUSTOM_TAGS);
    if (stored) {
      return JSON.parse(stored) as Tag[];
    }
  } catch (error) {
    console.error('Error reading custom tags:', error);
  }
  return [];
};

const saveCustomTags = (tags: Tag[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS_SYSTEM.CUSTOM_TAGS, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving custom tags:', error);
  }
};

export const systemOptionsService = {
  getAll: async (): Promise<SystemOptions> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const baseOptions = mockSystemOptionsData as SystemOptions;
    const customTags = getCustomTags();
    return {
      ...baseOptions,
      tags: [...baseOptions.tags, ...customTags],
    };
  },

  addCustomTag: async (name: string, color: string): Promise<Tag> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const customTags = getCustomTags();
    const newTag: Tag = {
      id: `custom-tag-${Date.now()}`,
      name,
      color,
    };
    customTags.push(newTag);
    saveCustomTags(customTags);
    return newTag;
  },

  deleteCustomTag: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const customTags = getCustomTags();
    const filtered = customTags.filter(t => t.id !== id);
    if (filtered.length !== customTags.length) {
      saveCustomTags(filtered);
      return true;
    }
    return false;
  },
};