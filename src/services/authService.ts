import { AuthUser, LoginCredentials, AppInterface, ROLE_INTERFACE_MAP } from '@/types/auth';
import mockData from '@/data/mockUsers.json';

// Storage keys
const AUTH_USER_KEY = 'proenglish_auth_user';
const AUTH_TOKEN_KEY = 'proenglish_auth_token';

// Types for mock data
interface StaffMember {
  id: string;
  email: string;
  username?: string;
  password: string;
  role: string;
  interface: string;
  isActive: boolean;
  fullName: string;
  avatarUrl?: string;
}

interface MockClient {
  id: string;
  email: string;
  username?: string;
  password: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  avatarUrl?: string;
  role?: string;
  interface?: string;
}

/**
 * Authentication Service
 * 
 * This service handles all authentication logic.
 * Currently uses local JSON data for development.
 * Can be easily replaced with real API calls later.
 */
class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { email, password } = credentials;

    // Simulate network delay
    await this.simulateDelay(500);

    // Search in staff users
    const staffUser = mockData.staff.find(
      (user: StaffMember) => 
        (user.email.toLowerCase() === email.toLowerCase() || 
         user.username?.toLowerCase() === email.toLowerCase()) &&
        user.password === password
    );

    if (staffUser) {
      return this.handleStaffLogin(staffUser);
    }

    // Search in clients
    const clientUser = mockData.clients.find(
      (client: MockClient) =>
        (client.email.toLowerCase() === email.toLowerCase() ||
         client.username?.toLowerCase() === email.toLowerCase()) &&
        client.password === password
    );

    if (clientUser) {
      return this.handleClientLogin(clientUser);
    }

    throw new Error('Invalid email or password');
  }

  /**
   * Handle staff user login
   */
  private handleStaffLogin(user: StaffMember): AuthUser {
    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role as AuthUser['role'],
      interface: user.interface as AppInterface,
      avatarUrl: user.avatarUrl,
    };

    this.persistSession(authUser);
    return authUser;
  }

  /**
   * Handle client login
   */
  private handleClientLogin(client: MockClient): AuthUser {
    if (!client.isActive) {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    const authUser: AuthUser = {
      id: client.id,
      email: client.email,
      username: client.username,
      fullName: client.name,
      role: 'Client',
      interface: 'Client',
      avatarUrl: client.avatarUrl,
    };

    this.persistSession(authUser);
    return authUser;
  }

  /**
   * Persist user session to localStorage
   */
  private persistSession(user: AuthUser): void {
    // Generate a mock token
    const token = this.generateMockToken(user);
    
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Generate a mock JWT-like token
   */
  private generateMockToken(user: AuthUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      interface: user.interface,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
  }

  /**
   * Get current authenticated user from storage
   */
  getCurrentUser(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(AUTH_USER_KEY);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!userJson || !token) {
        return null;
      }

      // Validate token expiration
      const tokenPayload = JSON.parse(atob(token));
      if (tokenPayload.exp < Date.now()) {
        this.logout();
        return null;
      }

      return JSON.parse(userJson);
    } catch {
      this.logout();
      return null;
    }
  }

  /**
   * Logout user and clear session
   */
  logout(): void {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Get the interface route based on user role
   */
  getInterfaceRoute(role: AuthUser['role']): string {
    const interfaceType = ROLE_INTERFACE_MAP[role];
    
    switch (interfaceType) {
      case 'Admin':
        return '/admin';
      case 'Teacher':
        return '/teacher';
      case 'Client':
        return '/client';
      default:
        return '/login';
    }
  }

  /**
   * Check if user has access to a specific interface
   */
  hasAccessToInterface(userInterface: AppInterface, requiredInterface: AppInterface): boolean {
    return userInterface === requiredInterface;
  }

  /**
   * Simulate network delay for realistic UX
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;