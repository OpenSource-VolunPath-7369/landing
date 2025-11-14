import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones-page.component.html',
  styleUrls: ['./notificaciones-page.component.css']
})
export default class NotificacionesPageComponent implements OnInit {
  notifications: Notification[] = [];

  ngOnInit() {
    console.log('NotificacionesPageComponent initialized');
    this.loadNotifications();
    console.log('Notifications loaded:', this.notifications);
  }

  loadNotifications() {
    this.notifications = [
      {
        id: '1',
        icon: 'fa-solid fa-hand-holding-heart',
        iconType: 'fontawesome',
        title: 'Juventud Solidaria',
        message: 'te envió un nuevo mensaje',
        timestamp: new Date(),
        isRead: false,
        type: 'message'
      },
      {
        id: '2',
        icon: '/assets/sonrisa.png',
        iconType: 'image',
        title: 'Sonrisas en Marcha',
        message: 'te envió un nuevo mensaje',
        timestamp: new Date(),
        isRead: true,
        type: 'message'
      },
      {
        id: '3',
        icon: '/assets/luis.png',
        iconType: 'image',
        title: 'Luis Fernández',
        message: 'terminó una tarea',
        timestamp: new Date(),
        isRead: true,
        type: 'task'
      },
      {
        id: '4',
        icon: '/assets/andrea.png',
        iconType: 'image',
        title: 'Andrea Paredes',
        message: 'aceptó la invitación a la organización',
        timestamp: new Date(),
        isRead: true,
        type: 'invitation'
      }
    ];
  }

  markAsRead(notification: Notification) {
    notification.isRead = true;
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }
}
