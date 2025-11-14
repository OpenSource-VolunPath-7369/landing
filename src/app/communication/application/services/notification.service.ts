import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { Notification } from '../../domain/model/notification';

/**
 * Application service for managing notifications.
 * 
 * @remarks
 * This service handles notification-related operations in the Communication bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    // El backend no tiene un endpoint para obtener todas las notificaciones
    // Solo se pueden obtener por userId, así que no cargamos aquí
    // Se cargarán cuando se llame a getNotificationsByUserId
  }

  private mapToNotification(data: any): Notification {
    return new Notification(
      String(data.id),
      String(data.userId),
      data.title,
      data.message,
      this.mapBackendNotificationTypeToFrontend(data.type),
      data.isRead || false,
      data.createdAt || new Date().toISOString(),
      data.actionUrl || ''
    );
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getNotificationsByUserId(userId: string): Observable<Notification[]> {
    // El backend usa /notifications/user/{userId}
    return this.apiService.get<any[]>(`notifications/user/${userId}`).pipe(
      map(notifications => {
        const mappedNotifications = notifications.map(notif => this.mapToNotification(notif));
        this.notificationsSubject.next(mappedNotifications);
        return mappedNotifications;
      })
    );
  }

  getUnreadNotifications(userId: string): Observable<Notification[]> {
    return this.getNotificationsByUserId(userId).pipe(
      map(notifications => notifications.filter(notif => !notif.isRead))
    );
  }

  markAsRead(notificationId: string): Observable<Notification> {
    // El backend usa PUT /notifications/{id}/read
    return this.apiService.put<any>(`notifications/${notificationId}/read`, {}).pipe(
      map(notif => this.mapToNotification(notif)),
      tap(updatedNotification => {
        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next(
          currentNotifications.map(notification => 
            notification.id === notificationId ? updatedNotification : notification
          )
        );
      })
    );
  }

  createNotification(notificationData: Partial<Notification>): Observable<Notification> {
    const newNotification = {
      userId: Number(notificationData.userId),
      title: notificationData.title,
      message: notificationData.message,
      type: this.mapFrontendNotificationTypeToBackend(notificationData.type || 'general'),
      actionUrl: notificationData.actionUrl
    };

    return this.apiService.post<any>('notifications', newNotification).pipe(
      map(notif => this.mapToNotification(notif)),
      tap(createdNotification => {
        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next([createdNotification, ...currentNotifications]);
      })
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.apiService.delete<void>(`notifications/${id}`).pipe(
      tap(() => {
        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next(
          currentNotifications.filter(notification => notification.id !== id)
        );
      })
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(
          notification => notification.userId === userId && notification.isUnread()
        ).length;
        observer.next(unreadCount);
      });
    });
  }

  private mapBackendNotificationTypeToFrontend(backendType: string): 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general' {
    const typeMap: { [key: string]: 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general' } = {
      'NEW_ACTIVITY': 'new_activity',
      'NEW_MESSAGE': 'new_message',
      'ACTIVITY_CONFIRMED': 'activity_confirmed',
      'ACTIVITY_CANCELLED': 'activity_cancelled',
      'GENERAL': 'general'
    };
    return typeMap[backendType] || 'general';
  }

  private mapFrontendNotificationTypeToBackend(frontendType: string): string {
    const typeMap: { [key: string]: string } = {
      'new_activity': 'NEW_ACTIVITY',
      'new_message': 'NEW_MESSAGE',
      'activity_confirmed': 'ACTIVITY_CONFIRMED',
      'activity_cancelled': 'ACTIVITY_CANCELLED',
      'general': 'GENERAL'
    };
    return typeMap[frontendType] || 'GENERAL';
  }
}


