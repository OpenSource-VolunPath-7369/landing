import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CommunityService } from '../../services/community.service';
import { ActivityService } from '../../services/activity.service';
import { Activity, Organization } from '../../interfaces';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-comunidad-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './comunidad-page.component.html',
  styleUrls: ['./comunidad-page.component.css']
})
export default class ComunidadPageComponent implements OnInit, OnDestroy {
  activities: Activity[] = [];
  organizations: Organization[] = [];
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private communityService: CommunityService,
    private activityService: ActivityService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.loading = true;
    this.error = null;

    // Load activities
    this.activityService.getActivities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities) => {
          this.activities = activities;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar las actividades';
          this.loading = false;
          console.error('Error loading activities:', error);
        }
      });

    // Load organizations
    this.communityService.getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organizations) => {
          this.organizations = organizations;
        },
        error: (error) => {
          console.error('Error loading organizations:', error);
        }
      });
  }

  toggleLike(activity: Activity) {
    this.activityService.likeActivity(activity.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedActivity) => {
          // Activity is already updated in the service
          console.log('Activity liked:', updatedActivity);
        },
        error: (error) => {
          console.error('Error liking activity:', error);
          // Revert the change if there was an error
          this.loadData();
        }
      });
  }

  registerForActivity(activity: Activity) {
    // This would typically require user authentication
    const userId = '1'; // Mock user ID
    
    if (this.activityService.isUserRegisteredForActivity(userId, activity.id)) {
      alert('Ya estás registrado en esta actividad');
      return;
    }

    this.activityService.registerForActivity({
      userId,
      activityId: activity.id,
      notes: 'Registro desde la página de comunidad'
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registration) => {
          alert('Te has registrado exitosamente en la actividad');
          console.log('Registration created:', registration);
        },
        error: (error) => {
          console.error('Error registering for activity:', error);
          alert('Error al registrarse en la actividad');
        }
      });
  }

  retry() {
    this.loadData();
  }
}
