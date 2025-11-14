import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { Project } from '../../domain/model/project';
import { VolunteerRegistration } from '../../../volunteers/domain/model/volunteer-registration';

/**
 * Application service for managing projects.
 * 
 * @remarks
 * This service handles project-related operations in the Projects bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private registrationsSubject = new BehaviorSubject<VolunteerRegistration[]>([]);
  
  public projects$ = this.projectsSubject.asObservable();
  public registrations$ = this.registrationsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadProjects();
    this.loadRegistrations();
  }

  private loadProjects(): void {
    this.apiService.get<any[]>('activities').subscribe(
      activities => {
        const projects = activities.map(activity => this.mapToProject(activity));
        this.projectsSubject.next(projects);
      }
    );
  }

  private loadRegistrations(): void {
    this.apiService.get<any[]>('volunteerRegistrations').subscribe(
      registrations => {
        const mappedRegistrations = registrations.map(reg => this.mapToRegistration(reg));
        this.registrationsSubject.next(mappedRegistrations);
      }
    );
  }

  private mapToProject(data: any): Project {
    return new Project(
      data.id,
      data.title,
      data.description,
      data.image,
      data.organizationId,
      data.organizationName,
      data.organizationLogo,
      data.date,
      data.time,
      data.duration,
      data.location,
      data.maxVolunteers,
      data.currentVolunteers,
      data.likes,
      data.isLiked,
      data.status,
      data.category,
      data.tags,
      data.requirements,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToRegistration(data: any): VolunteerRegistration {
    return new VolunteerRegistration(
      data.id,
      data.userId,
      data.activityId,
      data.status,
      data.registeredAt,
      data.notes
    );
  }

  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  getProjectById(id: string): Observable<Project> {
    return this.apiService.get<any>(`activities/${id}`).pipe(
      map(activity => this.mapToProject(activity))
    );
  }

  getProjectsByOrganization(organizationId: string): Observable<Project[]> {
    return this.apiService.get<any[]>(`activities?organizationId=${organizationId}`).pipe(
      map(activities => activities.map(activity => this.mapToProject(activity)))
    );
  }

  createProject(projectData: Partial<Project>): Observable<Project> {
    const newProject = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVolunteers: 0,
      likes: 0,
      isLiked: false,
      status: 'active'
    };

    return this.apiService.post<any>('activities', newProject).pipe(
      map(activity => this.mapToProject(activity)),
      tap(createdProject => {
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next([createdProject, ...currentProjects]);
      })
    );
  }

  updateProject(id: string, projectData: Partial<Project>): Observable<Project> {
    const updatedProject = {
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    return this.apiService.put<any>(`activities/${id}`, updatedProject).pipe(
      map(activity => this.mapToProject(activity)),
      tap(updatedProject => {
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next(
          currentProjects.map(p => p.id === id ? updatedProject : p)
        );
      })
    );
  }

  deleteProject(id: string): Observable<void> {
    return this.apiService.delete<void>(`activities/${id}`).pipe(
      tap(() => {
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next(
          currentProjects.filter(p => p.id !== id)
        );
      })
    );
  }

  likeProject(id: string): Observable<Project> {
    const project = this.projectsSubject.value.find(p => p.id === id);
    if (project) {
      project.updateLikeStatus(!project.isLiked);
      
      this.projectsSubject.next(
        this.projectsSubject.value.map(p => p.id === id ? project : p)
      );
      
      return this.apiService.patch<any>(`activities/${id}`, {
        likes: project.likes,
        isLiked: project.isLiked
      }).pipe(
        map(activity => this.mapToProject(activity))
      );
    }
    return throwError(() => new Error('Project not found'));
  }

  // Volunteer Registrations
  getRegistrations(): Observable<VolunteerRegistration[]> {
    return this.registrations$;
  }

  getRegistrationsByUser(userId: string): Observable<VolunteerRegistration[]> {
    return this.apiService.get<any[]>(`volunteerRegistrations?userId=${userId}`).pipe(
      map(registrations => registrations.map(reg => this.mapToRegistration(reg)))
    );
  }

  getRegistrationsByProject(projectId: string): Observable<VolunteerRegistration[]> {
    return this.apiService.get<any[]>(`volunteerRegistrations?activityId=${projectId}`).pipe(
      map(registrations => registrations.map(reg => this.mapToRegistration(reg)))
    );
  }

  registerForProject(registration: Partial<VolunteerRegistration>): Observable<VolunteerRegistration> {
    const newRegistration = {
      ...registration,
      registeredAt: new Date().toISOString(),
      status: 'pending'
    };

    return this.apiService.post<any>('volunteerRegistrations', newRegistration).pipe(
      map(reg => this.mapToRegistration(reg)),
      tap(createdRegistration => {
        const currentRegistrations = this.registrationsSubject.value;
        this.registrationsSubject.next([createdRegistration, ...currentRegistrations]);
        
        // Update project volunteer count
        this.updateProjectVolunteerCount(registration.activityId!, 1);
      })
    );
  }

  updateRegistrationStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Observable<VolunteerRegistration> {
    return this.apiService.patch<any>(`volunteerRegistrations/${id}`, { status }).pipe(
      map(reg => this.mapToRegistration(reg)),
      tap(updatedRegistration => {
        const currentRegistrations = this.registrationsSubject.value;
        this.registrationsSubject.next(
          currentRegistrations.map(r => r.id === id ? updatedRegistration : r)
        );
      })
    );
  }

  cancelRegistration(id: string): Observable<void> {
    return this.apiService.delete<void>(`volunteerRegistrations/${id}`).pipe(
      tap(() => {
        const currentRegistrations = this.registrationsSubject.value;
        const registration = currentRegistrations.find(r => r.id === id);
        
        if (registration) {
          this.registrationsSubject.next(
            currentRegistrations.filter(r => r.id !== id)
          );
          
          // Update project volunteer count
          this.updateProjectVolunteerCount(registration.activityId, -1);
        }
      })
    );
  }

  private updateProjectVolunteerCount(projectId: string, change: number): void {
    const currentProjects = this.projectsSubject.value;
    const updatedProjects = currentProjects.map(project => {
      if (project.id === projectId) {
        if (change > 0) {
          project.incrementVolunteerCount();
        } else {
          project.decrementVolunteerCount();
        }
        return project;
      }
      return project;
    });
    this.projectsSubject.next(updatedProjects);
  }

  isUserRegisteredForProject(userId: string, projectId: string): boolean {
    return this.registrationsSubject.value.some(
      registration => registration.userId === userId && 
                     registration.activityId === projectId && 
                     !registration.isCancelled()
    );
  }
}


