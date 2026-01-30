// Client status stages
export type ClientStatus =
  | 'New'
  | 'Booked a placement test'
  | 'Waiting'
  | 'In training'
  | 'Completed training'
  | 'Inactive';

// Gender options
export type Gender = 'Male' | 'Female';

// ================================
// 1️⃣ SYSTEM DATA (Auto-generated)
// ================================
export interface ClientSystemData {
  id: string; // Client Code / Unique Identifier
  createdAt: string; // Timestamp
  updatedAt: string; // Timestamp
  addedBy: {
    userId: string;
    role: string;
    interface: string;
  };
}

// ================================
// 2️⃣ PERSONAL INFORMATION
// ================================
export interface ClientPersonalInfo {
  // Required fields
  name: string;
  phoneNumber: string;
  email: string;
  // Optional fields
  jobTitle?: string;
  age?: number;
  gender?: Gender;
  city?: string;
  country?: string;
  guardianNumber?: string;
}

// ================================
// 3️⃣ PRODUCT / BUSINESS DATA
// ================================
export interface ClientProductData {
  currentPath?: string;
  pathCost?: number;
  paidForPath?: number;
  remainingForPath?: number;
  pathCourses?: string[];
  selectedTimeSlots?: string[];
  preferredTrainingDays?: string[];
  availabilityTime?: string;
  currentProgram?: string;
  programType?: string;
  source?: string;
  tags?: string[];
  underCompany?: string;
  assignedCoordinator?: string;
  totalPaidEver?: number;
}

// ================================
// 4️⃣ CLIENT STATUS
// ================================
export interface ClientStatusData {
  status: ClientStatus;
  statusHistory?: {
    status: ClientStatus;
    changedAt: string;
    changedBy: string;
  }[];
}

// ================================
// COMPLETE CLIENT SCHEMA
// ================================
export interface Client extends ClientSystemData, ClientPersonalInfo, ClientProductData, ClientStatusData {
  // Auth-related fields
  password: string; // For login (would be hashed in real app)
  username?: string;
  isActive: boolean;
  avatarUrl?: string;
  // Extra Fields (Dynamic)
  extraFields?: Record<string, string | number | boolean>;
}

// Client creation payload (minimal required fields)
export interface CreateClientPayload {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  // Extra Fields
  extraFields?: Record<string, string | number | boolean>;
}

// Client update payload (partial update)
export type UpdateClientPayload = Partial<Omit<Client, 'id' | 'createdAt' | 'addedBy'>>;
