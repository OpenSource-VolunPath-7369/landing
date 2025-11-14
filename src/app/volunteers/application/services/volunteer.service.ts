import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { Volunteer } from '../../domain/model/volunteer';

/**
 * Application service for managing volunteers.
 * 
 * @remarks
 * This service handles volunteer-related operations in the Volunteers bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private volunteersSubject = new BehaviorSubject<Volunteer[]>([]);
  public volunteers$ = this.volunteersSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadVolunteers();
  }

  private loadVolunteers(): void {
    this.apiService.get<any[]>('volunteers').subscribe(
      volunteers => {
        const mappedVolunteers = volunteers.map(vol => this.mapToVolunteer(vol));
        this.volunteersSubject.next(mappedVolunteers);
        console.log('Volunteers loaded from backend:', mappedVolunteers.length, mappedVolunteers);
      },
      error => {
        console.error('Error loading volunteers:', error);
        this.volunteersSubject.next([]);
      }
    );
  }

  private mapToVolunteer(data: any): Volunteer {
    return new Volunteer(
      String(data.id),
      data.name,
      data.email,
      data.avatar,
      'volunteer', // Los voluntarios siempre tienen este rol
      data.createdAt || new Date().toISOString(),
      data.bio,
      data.skills || [],
      data.location
    );
  }

  getVolunteers(): Observable<Volunteer[]> {
    return this.volunteers$;
  }

  refreshVolunteers(): void {
    this.loadVolunteers();
  }

  getVolunteerById(id: string): Observable<Volunteer> {
    return this.apiService.get<any>(`volunteers/${id}`).pipe(
      map(volunteer => this.mapToVolunteer(volunteer))
    );
  }

  createVolunteer(volunteerData: Partial<Volunteer> & { userId?: number | null }): Observable<Volunteer> {
    const newVolunteer: any = {
      name: volunteerData.name,
      email: volunteerData.email,
      avatar: volunteerData.avatar,
      bio: volunteerData.bio,
      location: volunteerData.location,
      skills: volunteerData.skills || []
    };
    
    // Solo incluir userId si está presente
    if (volunteerData.userId !== undefined && volunteerData.userId !== null) {
      newVolunteer.userId = volunteerData.userId;
    }

    return this.apiService.post<any>('volunteers', newVolunteer).pipe(
      map(volunteer => this.mapToVolunteer(volunteer)),
      tap(createdVolunteer => {
        const currentVolunteers = this.volunteersSubject.value;
        this.volunteersSubject.next([createdVolunteer, ...currentVolunteers]);
      })
    );
  }

  updateVolunteer(id: string, volunteerData: Partial<Volunteer>): Observable<Volunteer> {
    // Preparar datos según el formato del backend
    const updateData: any = {
      name: volunteerData.name,
      email: volunteerData.email,
      avatar: volunteerData.avatar,
      bio: volunteerData.bio,
      location: volunteerData.location,
      skills: volunteerData.skills || []
    };
    
    return this.apiService.put<any>(`volunteers/${id}`, updateData).pipe(
      map(volunteer => this.mapToVolunteer(volunteer)),
      tap(updatedVolunteer => {
        const currentVolunteers = this.volunteersSubject.value;
        this.volunteersSubject.next(
          currentVolunteers.map(v => v.id === id ? updatedVolunteer : v)
        );
      })
    );
  }

  deleteVolunteer(id: string): Observable<void> {
    return this.apiService.delete<void>(`volunteers/${id}`).pipe(
      tap(() => {
        const currentVolunteers = this.volunteersSubject.value;
        this.volunteersSubject.next(
          currentVolunteers.filter(v => v.id !== id)
        );
      })
    );
  }
}


