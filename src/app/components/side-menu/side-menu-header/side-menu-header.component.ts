import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/application/services/auth.service';
import { User } from '../../../interfaces';

@Component({
  selector: 'side-menu-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-menu-header.component.html',

})
export class SideMenuHeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    // Suscribirse a cambios del usuario
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isVolunteer(): boolean {
    return this.authService.isVolunteer();
  }

  getUserName(): string {
    return this.currentUser?.name || 'Usuario';
  }

  getUserAvatar(): string {
    return this.currentUser?.avatar || 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&q=80';
  }

  getUserType(): string {
    if (this.isVolunteer()) {
      return 'Voluntario';
    } else {
      return 'Organización';
    }
  }
}
