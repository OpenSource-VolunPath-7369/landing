import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { Publication, DashboardTab } from '../../interfaces';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export default class DashboardPageComponent implements OnInit, OnDestroy {
  tabs: DashboardTab[] = [];
  publications: Publication[] = [];
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadTabs();
    this.loadPublications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTabs() {
    this.dashboardService.tabs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tabs => {
        this.tabs = tabs;
      });
  }

  private loadPublications() {
    this.loading = true;
    this.error = null;

    this.dashboardService.getPublications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (publications) => {
          this.publications = publications;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar las publicaciones';
          this.loading = false;
          console.error('Error loading publications:', error);
        }
      });
  }

  selectTab(tabId: string) {
    this.dashboardService.selectTab(tabId);
  }

  editPublication(publicationId: string) {
    console.log('Editando publicación:', publicationId);
    this.router.navigate(['/nueva-publicacion'], { 
      queryParams: { id: publicationId, edit: 'true' } 
    });
  }

  deletePublication(publicationId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.dashboardService.deletePublication(publicationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Publicación eliminada:', publicationId);
            this.loadPublications(); // Recargar publicaciones después de eliminar
          },
          error: (error) => {
            console.error('Error deleting publication:', error);
            alert('Error al eliminar la publicación');
          }
        });
    }
  }

  createNewPublication() {
    console.log('Navegando a nueva publicación');
    this.router.navigate(['/nueva-publicacion']);
  }

  retry() {
    this.loadPublications();
  }
}
