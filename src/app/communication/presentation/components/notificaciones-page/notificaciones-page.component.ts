import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { NotificationService } from '../../../application/services/notification.service';
import { MessageService } from '../../../application/services/message.service';
import { AuthService } from '../../../../auth/application/services/auth.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { ApiService } from '../../../../shared/infrastructure/api.service';
import { Notification } from '../../../domain/model/notification';
import { Message } from '../../../domain/model/message';
import { User } from '../../../../interfaces';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

/**
 * Notifications page component.
 * 
 * @remarks
 * This component is part of the Communication bounded context presentation layer.
 */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './notificaciones-page.component.html',
  styleUrls: ['./notificaciones-page.component.css']
})
export default class NotificacionesPageComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  
  // Modal de mensaje
  showMessageModal = false;
  selectedMessage: Message | null = null;
  replyForm: FormGroup;
  sendingReply = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    private authService: AuthService,
    private organizationService: OrganizationService,
    private apiService: ApiService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    console.log('NotificacionesPageComponent initialized');
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications() {
    this.loading = true;
    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser?.id || '1';
    
    console.log('Loading notifications for user:', userId, 'Role:', this.currentUser?.role, 'Email:', this.currentUser?.email);
    
    // Si es organización, buscar también por el userId de la organización
    if (this.authService.isOrganization()) {
      this.organizationService.getOrganizations()
      .pipe(
        takeUntil(this.destroy$),
              map(organizations => {
            // Buscar organización que corresponda al usuario actual
            let userOrg = organizations.find(org => {
              const orgEmail = org.email.toLowerCase().trim();
              const userEmail = this.currentUser?.email.toLowerCase().trim() || '';
              return orgEmail === userEmail;
            });
            
            if (!userOrg && this.currentUser?.bio) {
              const bioMatch = this.currentUser.bio.match(/organización:\s*(.+)/i);
              if (bioMatch && bioMatch[1]) {
                const orgNameFromBio = bioMatch[1].trim();
                userOrg = organizations.find(org => 
                  org.name.toLowerCase().trim() === orgNameFromBio.toLowerCase()
                );
              }
            }
            
            // Obtener el userId de la organización desde el backend
            const orgUserId = userOrg ? (userOrg as any).userId : null;
            console.log('Organization found:', {
              orgId: userOrg?.id,
              orgUserId: orgUserId,
              currentUserId: userId
            });
            
            return { orgUserId, userOrg };
          }),
          switchMap(({ orgUserId, userOrg }) => {
            // Si la organización tiene userId, obtenerlo del backend para asegurarnos
            if (userOrg?.id) {
              return this.apiService.get<any>(`organizations/${userOrg.id}`).pipe(
                map(org => ({
                  orgUserId: org.userId || orgUserId,
                  currentUserId: userId
                }))
              );
            }
            return of({ orgUserId: null, currentUserId: userId });
          }),
          switchMap(({ orgUserId, currentUserId }) => {
            // Obtener notificaciones por userId del usuario y también por userId de la organización si existe
            const userIdsToCheck = orgUserId ? [currentUserId, String(orgUserId)] : [currentUserId];
            console.log('Checking notifications for userIds:', userIdsToCheck);
            
            // Obtener notificaciones para cada userId y combinarlas
            const notificationObservables = userIdsToCheck.map(id => 
              this.notificationService.getNotificationsByUserId(id).pipe(
                catchError(() => of([])) // Si falla, retornar array vacío
              )
            );
            
            return forkJoin(notificationObservables).pipe(
              map(notificationArrays => {
                // Combinar todas las notificaciones y eliminar duplicados
                const allNotifications = notificationArrays.flat();
                const uniqueNotifications = Array.from(
                  new Map(allNotifications.map(n => [n.id, n])).values()
                );
                console.log('Combined notifications for organization:', {
                  userIdsToCheck: userIdsToCheck,
                  totalCombined: uniqueNotifications.length,
                  notifications: uniqueNotifications.map(n => ({ id: n.id, userId: n.userId, title: n.title }))
                });
                return uniqueNotifications;
              })
            );
          })
        )
        .subscribe({
          next: (notifications) => {
            this.notifications = notifications;
            
            // Ordenar por fecha (más recientes primero)
            this.notifications.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });
            
            this.loading = false;
            console.log('Final notifications loaded for organization:', this.notifications.length, this.notifications);
          },
          error: (error) => {
            this.error = 'Error al cargar las notificaciones';
            this.loading = false;
            console.error('Error loading notifications:', error);
          }
        });
    } else {
      // Para voluntarios, usar el endpoint normal
      this.notificationService.getNotificationsByUserId(userId)
        .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
            this.notifications = notifications;
          
          // Ordenar por fecha (más recientes primero)
          this.notifications.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          
          this.loading = false;
            console.log('Final notifications loaded for volunteer:', this.notifications.length, this.notifications);
        },
        error: (error) => {
          this.error = 'Error al cargar las notificaciones';
          this.loading = false;
          console.error('Error loading notifications:', error);
        }
      });
    }
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

  markAsRead(notification: Notification) {
    if (notification.isUnread()) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notification.markAsRead();
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          }
        });
    }
  }

  /**
   * Handle notification click - show message modal or navigate
   */
  onNotificationClick(notification: Notification) {
    // Marcar como leída
    this.markAsRead(notification);

    // Si es un mensaje, mostrar modal con el mensaje completo
    if (notification.type === 'new_message') {
      this.loadAndShowMessage(notification);
    } else if (notification.actionUrl) {
      // Si tiene una URL de acción, navegar a esa URL
      this.router.navigate([notification.actionUrl]);
    } else if (notification.type === 'activity_confirmed' || notification.type === 'activity_cancelled') {
      // Navegar a comunidad para actividades
      this.router.navigate(['/comunidad']);
    } else if (notification.type === 'new_activity') {
      // Navegar a comunidad para nuevas actividades
      this.router.navigate(['/comunidad']);
    }
  }

  /**
   * Load message and show in modal
   */
  loadAndShowMessage(notification: Notification) {
    const userId = this.currentUser?.id || '1';
    const isOrganization = this.authService.isOrganization();
    
    // Extraer el nombre del remitente y el asunto del mensaje de la notificación
    let senderName = '';
    let messageSubject = '';
    
    // El formato de la notificación es: "Nuevo mensaje [Nombre] te envió un mensaje: [Asunto]"
    // O simplemente: "[Nombre] te envió un mensaje: [Asunto]"
    const messageText = notification.message;
    
    if (messageText.includes(' te envió un mensaje: ')) {
      const messageParts = messageText.split(' te envió un mensaje: ');
      // El nombre puede estar después de "Nuevo mensaje " o ser el inicio
      let namePart = messageParts[0]?.trim() || '';
      if (namePart.startsWith('Nuevo mensaje ')) {
        namePart = namePart.replace('Nuevo mensaje ', '').trim();
      }
      senderName = namePart;
      messageSubject = messageParts[1]?.trim() || '';
    } else if (messageText.includes(' te envió un mensaje:')) {
      const messageParts = messageText.split(' te envió un mensaje:');
      let namePart = messageParts[0]?.trim() || '';
      if (namePart.startsWith('Nuevo mensaje ')) {
        namePart = namePart.replace('Nuevo mensaje ', '').trim();
      }
      senderName = namePart;
      messageSubject = messageParts[1]?.trim() || '';
    } else {
      // Fallback: intentar extraer nombre de las primeras palabras
      const words = messageText.split(' ');
      if (words.length >= 2) {
        senderName = `${words[0]} ${words[1]}`;
      } else if (words.length === 1) {
        senderName = words[0];
      }
    }

    console.log('=== BÚSQUEDA DE MENSAJE ===');
    console.log('Texto completo de notificación:', notification.message);
    console.log('Remitente extraído:', senderName);
    console.log('Asunto extraído:', messageSubject);
    console.log('Timestamp de notificación:', notification.createdAt);
    console.log('Es organización:', isOrganization);

    // Refrescar mensajes primero para asegurar que tenemos los más recientes
    this.messageService.refreshMessages();
    
    // Si es organización, obtener el organizationId primero
    if (isOrganization) {
      this.organizationService.getOrganizations()
        .pipe(
          takeUntil(this.destroy$),
          map(organizations => {
            // Buscar organización que corresponda al usuario actual
            let userOrg = organizations.find(org => {
              const orgEmail = org.email.toLowerCase().trim();
              const userEmail = this.currentUser?.email.toLowerCase().trim() || '';
              return orgEmail === userEmail;
            });
            
            if (!userOrg) {
              userOrg = organizations.find(org => {
                const orgName = org.name.toLowerCase().trim();
                const userName = this.currentUser?.name.toLowerCase().trim() || '';
                return orgName === userName || 
                       orgName.includes(userName) ||
                       userName.includes(orgName);
              });
            }
            
            if (!userOrg) {
              userOrg = organizations.find(org => {
                const orgEmail = org.email.toLowerCase().trim();
                const userEmail = this.currentUser?.email.toLowerCase().trim() || '';
                const orgEmailPrefix = orgEmail.split('@')[0];
                return userEmail.includes(orgEmailPrefix) || 
                       orgEmail.includes(userEmail.split('@')[0]);
              });
            }
            
            // Si aún no encontramos, buscar por el nombre de la organización en el bio del usuario
            if (!userOrg && this.currentUser?.bio) {
              userOrg = organizations.find(org => {
                const orgName = org.name.toLowerCase().trim();
                const userBio = this.currentUser?.bio.toLowerCase().trim() || '';
                // Buscar si el nombre de la organización aparece en el bio
                return userBio.includes(orgName) || orgName.includes(userBio);
              });
            }
            
            // Si aún no encontramos, buscar por palabras clave del nombre de la organización en el bio
            if (!userOrg && this.currentUser?.bio) {
              userOrg = organizations.find(org => {
                const orgNameWords = org.name.toLowerCase().split(' ');
                const userBio = this.currentUser?.bio.toLowerCase().trim() || '';
                // Buscar si alguna palabra clave del nombre de la organización aparece en el bio
                return orgNameWords.some(word => word.length > 3 && userBio.includes(word));
              });
            }
            
            return userOrg?.id;
          }),
          switchMap(organizationId => {
            const recipientIds = organizationId ? [userId, organizationId] : [userId];
            // Normalizar todos los IDs a strings para comparación
            const normalizedRecipientIds = recipientIds.map(id => String(id));
            console.log('IDs a buscar para mensajes:', recipientIds);
            console.log('IDs normalizados:', normalizedRecipientIds);
            
            return this.messageService.getMessages().pipe(
              map(messages => {
                console.log('Total mensajes cargados:', messages.length);
                console.log('Mensajes recibidos por userId:', messages.filter(msg => String(msg.recipientId) === String(userId)).length);
                console.log('Mensajes recibidos por organizationId:', organizationId ? messages.filter(msg => String(msg.recipientId) === String(organizationId)).length : 0);
                
                // Buscar mensajes recibidos del remitente
                // Priorizar mensajes que coincidan exactamente con el asunto
                let receivedMessages = messages.filter(msg => {
                  const msgRecipientId = String(msg.recipientId);
                  const isRecipient = normalizedRecipientIds.includes(msgRecipientId);
                  if (!isRecipient) return false;
                  
                  const senderNameMatch = msg.senderName && 
                    (msg.senderName.toLowerCase().trim() === senderName.toLowerCase().trim() ||
                     msg.senderName.toLowerCase().includes(senderName.toLowerCase().trim()) ||
                     senderName.toLowerCase().trim().includes(msg.senderName.toLowerCase()));
                  
                  if (!senderNameMatch) return false;
                  
                  // Si tenemos asunto, buscar coincidencia exacta primero
                  if (messageSubject) {
                    // El contenido del mensaje incluye "Asunto\n\nContenido"
                    const lines = msg.content.split('\n');
                    const msgSubject = lines[0]?.trim() || '';
                    const normalizedMsgSubject = msgSubject.toLowerCase().trim();
                    const normalizedNotificationSubject = messageSubject.toLowerCase().trim();
                    
                    // Coincidencia exacta
                    const exactSubjectMatch = normalizedMsgSubject === normalizedNotificationSubject;
                    // Coincidencia parcial (el asunto del mensaje contiene el de la notificación o viceversa)
                    const containsSubject = normalizedMsgSubject.includes(normalizedNotificationSubject) || 
                                           normalizedNotificationSubject.includes(normalizedMsgSubject);
                    // También buscar en todo el contenido
                    const contentContainsSubject = msg.content.toLowerCase().includes(normalizedNotificationSubject);
                    
                    console.log('Comparando asuntos:', {
                      msgSubject: msgSubject,
                      notificationSubject: messageSubject,
                      exactMatch: exactSubjectMatch,
                      containsMatch: containsSubject,
                      contentMatch: contentContainsSubject
                    });
                    
                    return exactSubjectMatch || containsSubject || contentContainsSubject;
                  }
                  
                  return true;
                });
                
                // Si no encontramos con asunto, buscar cualquier mensaje del remitente
                if (receivedMessages.length === 0 && senderName) {
                  receivedMessages = messages.filter(msg => {
                    const msgRecipientId = String(msg.recipientId);
                    const isRecipient = normalizedRecipientIds.includes(msgRecipientId);
                    const senderNameMatch = msg.senderName && 
                      (msg.senderName.toLowerCase().trim() === senderName.toLowerCase().trim() ||
                       msg.senderName.toLowerCase().includes(senderName.toLowerCase().trim()) ||
                       senderName.toLowerCase().trim().includes(msg.senderName.toLowerCase()));
                    
                    return isRecipient && senderNameMatch;
                  });
                }
                
                console.log('Mensajes encontrados del remitente:', receivedMessages.length);
                console.log('=== DETALLE DE MENSAJES ENCONTRADOS ===');
                receivedMessages.forEach((m, index) => {
                  const lines = m.content.split('\n');
                  const msgSubject = lines[0]?.trim() || '';
                  const msgContent = lines.slice(2).join('\n').trim() || lines[1]?.trim() || '';
                  console.log(`Mensaje ${index + 1}:`, {
                    id: m.id,
                    senderName: m.senderName,
                    subject: msgSubject,
                    contentPreview: msgContent.substring(0, 50),
                    timestamp: m.timestamp,
                    recipientId: m.recipientId
                  });
                });
                console.log('=== FIN DETALLE ===');
                
                return receivedMessages;
              })
            );
          })
        )
        .subscribe({
          next: (receivedMessages) => {
            this.processFoundMessages(receivedMessages, senderName, notification.createdAt, messageSubject);
          },
          error: (error) => {
            console.error('Error loading organization or messages:', error);
            // Fallback: buscar solo por userId
            this.searchMessagesByUserId(userId, senderName, messageSubject, notification.createdAt);
          }
        });
    } else {
      // Para voluntarios, buscar solo por userId
      this.searchMessagesByUserId(userId, senderName, messageSubject, notification.createdAt);
    }
  }

  private searchMessagesByUserId(userId: string, senderName: string, messageSubject: string, notificationTimestamp?: string) {
    this.messageService.getMessages()
      .pipe(
        takeUntil(this.destroy$),
        map(messages => {
          const normalizedUserId = String(userId);
          console.log('Total mensajes cargados:', messages.length);
          console.log('Mensajes recibidos por usuario:', messages.filter(msg => String(msg.recipientId) === normalizedUserId).length);
          
          // Buscar mensajes recibidos del remitente
          // Priorizar mensajes que coincidan exactamente con el asunto
          let receivedMessages = messages.filter(msg => {
            const msgRecipientId = String(msg.recipientId);
            const isRecipient = msgRecipientId === normalizedUserId;
            if (!isRecipient) return false;
            
            const senderNameMatch = msg.senderName && 
              (msg.senderName.toLowerCase().trim() === senderName.toLowerCase().trim() ||
               msg.senderName.toLowerCase().includes(senderName.toLowerCase().trim()) ||
               senderName.toLowerCase().trim().includes(msg.senderName.toLowerCase()));
            
            if (!senderNameMatch) return false;
            
            // Si tenemos asunto, buscar coincidencia exacta primero
            if (messageSubject) {
              // El contenido del mensaje incluye "Asunto\n\nContenido"
              const lines = msg.content.split('\n');
              const msgSubject = lines[0]?.trim() || '';
              const normalizedMsgSubject = msgSubject.toLowerCase().trim();
              const normalizedNotificationSubject = messageSubject.toLowerCase().trim();
              
              // Coincidencia exacta
              const exactSubjectMatch = normalizedMsgSubject === normalizedNotificationSubject;
              // Coincidencia parcial (el asunto del mensaje contiene el de la notificación o viceversa)
              const containsSubject = normalizedMsgSubject.includes(normalizedNotificationSubject) || 
                                     normalizedNotificationSubject.includes(normalizedMsgSubject);
              // También buscar en todo el contenido
              const contentContainsSubject = msg.content.toLowerCase().includes(normalizedNotificationSubject);
              
              return exactSubjectMatch || containsSubject || contentContainsSubject;
            }
            
            return true;
          });
          
          console.log('Mensajes encontrados del remitente (con asunto):', receivedMessages.length);
          
          // Si no encontramos con asunto, buscar cualquier mensaje del remitente
          if (receivedMessages.length === 0 && senderName) {
            receivedMessages = messages.filter(msg => {
              const msgRecipientId = String(msg.recipientId);
              const isRecipient = msgRecipientId === normalizedUserId;
              const senderNameMatch = msg.senderName && 
                (msg.senderName.toLowerCase().trim() === senderName.toLowerCase().trim() ||
                 msg.senderName.toLowerCase().includes(senderName.toLowerCase().trim()) ||
                 senderName.toLowerCase().trim().includes(msg.senderName.toLowerCase()));
              
              return isRecipient && senderNameMatch;
            });
            
            console.log('Mensajes encontrados del remitente (sin asunto):', receivedMessages.length);
          }
          
          console.log('=== DETALLE DE MENSAJES ENCONTRADOS ===');
          receivedMessages.forEach((m, index) => {
            const lines = m.content.split('\n');
            const msgSubject = lines[0]?.trim() || '';
            const msgContent = lines.slice(2).join('\n').trim() || lines[1]?.trim() || '';
            console.log(`Mensaje ${index + 1}:`, {
              id: m.id,
              senderName: m.senderName,
              subject: msgSubject,
              contentPreview: msgContent.substring(0, 50),
              timestamp: m.timestamp,
              recipientId: m.recipientId
            });
          });
          console.log('=== FIN DETALLE ===');
          
          return receivedMessages;
        })
      )
      .subscribe({
        next: (receivedMessages) => {
          this.processFoundMessages(receivedMessages, senderName, notificationTimestamp, messageSubject);
        },
        error: (error) => {
          console.error('Error loading messages:', error);
        }
      });
  }

  private processFoundMessages(receivedMessages: Message[], senderName: string, notificationTimestamp?: string, messageSubject?: string) {
    if (receivedMessages.length === 0) {
      console.log('No se encontraron mensajes del remitente');
      return;
    }
    
    console.log('Procesando mensajes encontrados:', receivedMessages.length);
    
    // Si tenemos asunto, priorizar mensajes que coincidan exactamente con el asunto
    let message: Message | null = null;
    
    if (messageSubject) {
      const normalizedSubject = messageSubject.toLowerCase().trim();
      // Buscar mensaje con asunto exacto
      const exactMatch = receivedMessages.find(msg => {
        const lines = msg.content.split('\n');
        const msgSubject = lines[0]?.trim() || '';
        return msgSubject.toLowerCase().trim() === normalizedSubject;
      });
      
      if (exactMatch) {
        message = exactMatch;
        console.log('Mensaje encontrado por asunto exacto:', message.id);
      }
    }
    
    // Si no encontramos por asunto exacto y tenemos timestamp, buscar por timestamp
    if (!message && notificationTimestamp) {
      const notificationTime = new Date(notificationTimestamp).getTime();
      // Buscar el mensaje cuyo timestamp sea más cercano al de la notificación
      message = receivedMessages.reduce((closest, current) => {
        const currentTime = new Date(current.timestamp).getTime();
        const closestTime = closest ? new Date(closest.timestamp).getTime() : Infinity;
        const currentDiff = Math.abs(currentTime - notificationTime);
        const closestDiff = Math.abs(closestTime - notificationTime);
        return currentDiff < closestDiff ? current : closest;
      }, null as Message | null);
      
      console.log('Mensaje encontrado por timestamp de notificación:', message?.id);
    }
    
    // Si no encontramos por timestamp o no hay timestamp, usar el más reciente
    if (!message) {
      // Ordenar por timestamp (más reciente primero)
      receivedMessages.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
      message = receivedMessages[0];
      console.log('Mensaje encontrado (más reciente):', message?.id);
    }
    
    if (message) {
      console.log('Mensaje encontrado:', message);
      this.selectedMessage = message;
      this.showMessageModal = true;
      this.replyForm.reset();
      
      // Marcar mensaje como leído si no lo está
      if (message.isUnread()) {
        this.messageService.markAsRead(message.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => console.log('Mensaje marcado como leído'),
            error: (err) => console.error('Error marcando mensaje como leído:', err)
          });
      }
    } else {
      console.log('No se encontró el mensaje, navegando a página de mensajes');
      // Si no se encuentra el mensaje, navegar a la página de mensajes
      this.router.navigate(['/mensajes'], {
        queryParams: { 
          from: senderName,
          highlight: 'true'
        } 
      });
    }
  }

  /**
   * Close message modal
   */
  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedMessage = null;
    this.replyForm.reset();
  }

  /**
   * Send reply to message
   */
  sendReply() {
    if (this.replyForm.valid && this.selectedMessage && !this.sendingReply && this.currentUser) {
      this.sendingReply = true;
      const userId = this.currentUser.id || '1';
      const replyContent = this.replyForm.value.content.trim();
      
      // Crear mensaje de respuesta
      const replyMessage: Partial<Message> = {
        senderId: userId,
        senderName: this.currentUser.name || 'Usuario',
        senderIcon: this.currentUser.avatar || '/assets/mundo.png',
        recipientId: this.selectedMessage.senderId,
        content: replyContent,
        type: 'general'
      };

      this.messageService.sendMessage(replyMessage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (sentMessage: Message) => {
            console.log('Reply sent successfully:', sentMessage);
            this.sendingReply = false;
            this.replyForm.reset();
            
            // Cerrar modal después de un breve delay
            setTimeout(() => {
              this.closeMessageModal();
            }, 500);
          },
          error: (error: any) => {
            console.error('Error sending reply:', error);
            this.sendingReply = false;
            alert('Error al enviar la respuesta. Por favor intenta nuevamente.');
          }
        });
    }
  }

  markAllAsRead() {
    if (!this.currentUser) return;
    const userId = this.currentUser.id || '1';
    this.notifications.forEach((notification: Notification) => {
      if (notification.isUnread() && notification.userId === userId) {
        this.markAsRead(notification);
      }
    });
  }

  retry() {
    this.loadNotifications();
  }
}


