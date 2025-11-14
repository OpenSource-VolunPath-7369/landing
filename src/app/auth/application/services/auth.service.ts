import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../../interfaces';

/**
 * Authentication Service
 * Manages user authentication state and role detection
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    // Cargar usuario al inicializar
    this.loadUserFromStorage();
  }

  /**
   * Get current user from storage
   */
  private getStoredUser(): User | null {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Load user from storage and update subject
   */
  private loadUserFromStorage(): void {
    const user = this.getStoredUser();
    this.currentUserSubject.next(user);
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
    return isAuth && this.getCurrentUser() !== null;
  }

  /**
   * Check if current user is a volunteer
   */
  isVolunteer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'volunteer';
  }

  /**
   * Check if current user is an organization admin
   */
  isOrganization(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'organization_admin';
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Login user and store in session
   */
  login(user: User): void {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Logout user
   */
  logout(): void {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberedUsername');
    this.currentUserSubject.next(null);
  }

  /**
   * Create a mock volunteer user for testing
   */
  createMockVolunteer(username: string): User {
    return {
      id: '1',
      name: username,
      email: `${username}@example.com`,
      avatar: '/assets/mundo.png',
      role: 'volunteer',
      joinedDate: new Date().toISOString(),
      bio: 'Voluntario comprometido con causas sociales',
      skills: ['Comunicación', 'Trabajo en equipo', 'Organización'],
      location: 'Lima, Perú'
    };
  }

  /**
   * Create a mock organization user for testing
   */
  createMockOrganization(username: string): User {
    return {
      id: '2',
      name: username,
      email: `${username}@example.com`,
      avatar: '/assets/mundo.png',
      role: 'organization_admin',
      joinedDate: new Date().toISOString(),
      bio: 'Organización dedicada al voluntariado',
      skills: [],
      location: 'Lima, Perú'
    };
  }
}


