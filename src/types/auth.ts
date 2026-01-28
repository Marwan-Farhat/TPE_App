// Interface types
export type AppInterface = 'Admin' | 'Teacher' | 'Client';

// Role types per interface
export type AdminRole = 'SuperAdmin' | 'Manager' | 'Supervisor' | 'Agent';
export type TeacherRole = 'Instructor' | 'Coach' | 'PlacementTester';
export type ClientRole = 'Client';

export type AppRole = AdminRole | TeacherRole | ClientRole;

// Mapping roles to interfaces
export const ROLE_INTERFACE_MAP: Record<AppRole, AppInterface> = {
  // Admin Interface roles
  SuperAdmin: 'Admin',
  Manager: 'Admin',
  Supervisor: 'Admin',
  Agent: 'Admin',
  // Teacher Interface roles
  Instructor: 'Teacher',
  Coach: 'Teacher',
  PlacementTester: 'Teacher',
  // Client Interface roles
  Client: 'Client',
};

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  username?: string;
  password: string; // In real app, this would be hashed
  role: AppRole;
  interface: AppInterface;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin/Teacher user (simple schema)
export interface StaffUser extends BaseUser {
  fullName: string;
  avatarUrl?: string;
  department?: string;
  phoneNumber?: string;
}

// Auth response after login
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  role: AppRole;
  interface: AppInterface;
  avatarUrl?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth state
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context type
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}