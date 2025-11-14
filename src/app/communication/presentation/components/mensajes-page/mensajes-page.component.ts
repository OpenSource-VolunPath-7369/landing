import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, filter, catchError, tap } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MessageListComponent } from '../../../../components/message-list/message-list.component';
import { MessageService } from '../../../application/services/message.service';
import { VolunteerService } from '../../../../volunteers/application/services/volunteer.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { AuthService } from '../../../../auth/application/services/auth.service';
import { NotificationService } from '../../../application/services/notification.service';
import { ApiService } from '../../../../shared/infrastructure/api.service';
import { Message } from '../../../domain/model/message';
import { Volunteer } from '../../../../volunteers/domain/model/volunteer';
import { Organization } from '../../../../organizations/domain/model/organization';
import { User } from '../../../../interfaces';

/**
 * Messages page component.
 * 
 * @remarks
 * This component is part of the Communication bounded context presentation layer.
 */
@Component({
  selector: 'app-mensajes-page',
  standalone: true,
  imports: [
    CommonModule, 
    MessageListComponent, 
    MatButtonModule, 
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatCardModule
  ],
  templateUrl: './mensajes-page.component.html',
  styleUrls: ['./mensajes-page.component.css']
})
export default class MensajesPageComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  volunteers: Volunteer[] = [];
  organizations: Organization[] = [];
  loading = false;
  error: string | null = null;
  unreadCount = 0;
  
  // Usuario actual y detección de rol
  currentUser: User | null = null;
  isVolunteerMode = false;
  
  // Formulario de envío de mensajes
  messageForm: FormGroup;
  selectedRecipients: Set<string> = new Set(); // Puede ser voluntarios u organizaciones
  sending = false;
  showSendForm = false;
  
  // Para resaltar mensajes de un remitente específico
  highlightSender: string | null = null;
  
  // Vista de mensaje
  selectedMessage: Message | null = null;
  replyForm: FormGroup;
  sendingReply = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private volunteerService: VolunteerService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.messageForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      url: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
    
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isVolunteerMode = this.authService.isVolunteer();
    
    // Detectar si estamos en la ruta del formulario
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const url = this.router.url;
        if (url.includes('/mensajes/formulario')) {
          this.showSendForm = true;
        } else if (url === '/mensajes') {
          this.showSendForm = false;
          this.selectedMessage = null;
        }
      });
    
    // Verificar la ruta inicial
    const currentUrl = this.router.url;
    if (currentUrl.includes('/mensajes/formulario')) {
      this.showSendForm = true;
    }
    
    // Leer query params para resaltar mensajes de un remitente específico
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['from']) {
          this.highlightSender = params['from'];
          console.log('Highlight sender from query params:', this.highlightSender);
          // Si hay un parámetro highlight, hacer scroll al mensaje después de cargar
          if (params['highlight'] === 'true') {
            // Esperar a que los mensajes se carguen antes de hacer scroll
            setTimeout(() => {
              this.scrollToHighlightedMessage();
            }, 1000);
          }
        }
      });
    
    this.loadMessages();
    
    if (this.isVolunteerMode) {
      // Si es voluntario, cargar organizaciones para enviar mensajes
      this.loadOrganizations();
    } else {
      // Si es organización, cargar voluntarios para enviar mensajes
    this.loadVolunteers();
    }
  }

  /**
   * Scroll to the first highlighted message
   */
  private scrollToHighlightedMessage() {
    if (this.highlightSender) {
      // Intentar varias veces hasta encontrar el elemento (por si los mensajes aún se están cargando)
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryScroll = () => {
        attempts++;
        const highlightedElement = document.querySelector('.message-item.highlighted');
        if (highlightedElement) {
          console.log('Found highlighted message, scrolling to it');
          highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Remover el resaltado después de 5 segundos
          setTimeout(() => {
            this.highlightSender = null;
            this.router.navigate(['/mensajes'], { replaceUrl: true });
          }, 5000);
        } else if (attempts < maxAttempts) {
          // Intentar de nuevo después de 200ms
          setTimeout(tryScroll, 200);
        } else {
          console.warn('Could not find highlighted message after', maxAttempts, 'attempts');
        }
      };
      
      tryScroll();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMessages() {
    this.loading = true;
    this.error = null;

    // Load messages for current user
    const userId = this.currentUser?.id || '1';
    
    // Primero refrescar los mensajes desde el servidor
    this.messageService.refreshMessages();
    
    // Si es una organización, necesitamos buscar también por organizationId
    if (this.isVolunteerMode) {
      // Para voluntarios, solo buscar por userId
      this.loadMessagesForUser(userId, [userId]);
    } else {
      // Para organizaciones, buscar por userId Y por organizationId
      this.organizationService.getOrganizations()
        .pipe(
          takeUntil(this.destroy$),
          map(organizations => {
            // Buscar organización que corresponda al usuario actual
            // Intentar múltiples métodos de búsqueda
            let userOrg = organizations.find(org => {
              const orgEmail = org.email.toLowerCase().trim();
              const userEmail = this.currentUser?.email.toLowerCase().trim() || '';
              return orgEmail === userEmail;
            });
            
            // Si no encontramos por email exacto, buscar por nombre parcial
            if (!userOrg) {
              userOrg = organizations.find(org => {
                const orgName = org.name.toLowerCase().trim();
                const userName = this.currentUser?.name.toLowerCase().trim() || '';
                return orgName === userName || 
                       orgName.includes(userName) ||
                       userName.includes(orgName);
              });
            }
            
            // Si aún no encontramos, buscar por email parcial
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
            
            const organizationId = userOrg?.id;
            console.log('Usuario actual:', this.currentUser?.name, this.currentUser?.email);
            console.log('Organización encontrada:', userOrg?.name, 'ID:', organizationId);
            console.log('Total organizaciones:', organizations.length);
            
            // Buscar mensajes por userId Y por organizationId
            const idsToCheck = organizationId ? [userId, organizationId] : [userId];
            console.log('IDs a buscar para mensajes:', idsToCheck);
            return { idsToCheck, organizationId };
          })
        )
        .subscribe({
          next: ({ idsToCheck, organizationId }) => {
            this.loadMessagesForUser(userId, idsToCheck, organizationId);
          },
          error: (error) => {
            console.error('Error loading organizations:', error);
            // Fallback: solo buscar por userId
            this.loadMessagesForUser(userId, [userId]);
          }
        });
    }
  }

  private loadMessagesForUser(userId: string, recipientIds: string[], organizationId?: string) {
    // Luego suscribirse a los mensajes actualizados
    this.messageService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allMessages) => {
          console.log('Total mensajes en BD:', allMessages.length);
          console.log('IDs a buscar:', recipientIds);
          console.log('OrganizationId:', organizationId);
          
          // Normalizar todos los IDs a strings para comparación
          const normalizedRecipientIds = recipientIds.map(id => String(id));
          const normalizedUserId = String(userId);
          
          // Mensajes recibidos: buscar por recipientId que coincida con userId o organizationId
          // Convertir recipientId a string para comparación
          const receivedMessages = allMessages.filter(msg => {
            const msgRecipientId = String(msg.recipientId);
            return normalizedRecipientIds.includes(msgRecipientId);
          });
          console.log('Mensajes recibidos (recipientId):', receivedMessages.length, receivedMessages.map(m => ({
            id: m.id,
            recipientId: m.recipientId,
            recipientIdType: typeof m.recipientId,
            senderName: m.senderName,
            content: m.content.substring(0, 50)
          })));
          
          // Mensajes enviados: buscar por senderId que coincida con userId
          const sentMessages = allMessages.filter(msg => String(msg.senderId) === normalizedUserId);
          console.log('Mensajes enviados (senderId):', sentMessages.length, sentMessages.map(m => ({
            id: m.id,
            senderId: m.senderId,
            recipientId: m.recipientId,
            content: m.content.substring(0, 50)
          })));
          
          // Mostrar mensajes recibidos Y enviados por el usuario actual
          // Para recibidos, buscar por cualquiera de los IDs (userId o organizationId)
          // Para enviados, buscar solo por userId
          this.messages = allMessages.filter(msg => {
            const msgRecipientId = String(msg.recipientId);
            const msgSenderId = String(msg.senderId);
            return normalizedRecipientIds.includes(msgRecipientId) || msgSenderId === normalizedUserId;
          });
          
          // Debug: mostrar todos los mensajes y sus recipientIds
          console.log('=== DEBUG MENSAJES ===');
          console.log('Todos los mensajes en BD:', allMessages.map(m => ({
            id: m.id,
            senderName: m.senderName,
            senderId: m.senderId,
            recipientId: m.recipientId,
            recipientIdType: typeof m.recipientId,
            content: m.content.substring(0, 30)
          })));
          console.log('IDs que estamos buscando:', recipientIds);
          console.log('Mensajes que coinciden con recipientIds:', allMessages.filter(msg => recipientIds.includes(msg.recipientId)).map(m => ({
            id: m.id,
            recipientId: m.recipientId,
            senderName: m.senderName
          })));
          console.log('Mensajes que coinciden con senderId:', allMessages.filter(msg => msg.senderId === userId).map(m => ({
            id: m.id,
            senderId: m.senderId,
            recipientId: m.recipientId,
            senderName: m.senderName
          })));
          console.log('=== FIN DEBUG ===');
          
          // Ordenar por timestamp (más recientes primero)
          this.messages.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          });
          
          this.loading = false;
          console.log('Mensajes cargados:', this.messages.length, 'Total en BD:', allMessages.length);
          console.log('Mensajes finales:', this.messages.map(m => ({ 
            id: m.id, 
            senderName: m.senderName,
            senderId: m.senderId,
            recipientId: m.recipientId,
            content: m.content.substring(0, 50) 
          })));
          
          // Si hay un highlightSender, verificar si hay mensajes que coincidan
          if (this.highlightSender) {
            const highlightedMessages = this.messages.filter(m => {
              const senderName = (m.senderName || '').toLowerCase().trim();
              const highlightName = this.highlightSender!.toLowerCase().trim();
              return senderName === highlightName || 
                     senderName.includes(highlightName) || 
                     highlightName.includes(senderName);
            });
            console.log('Mensajes resaltados encontrados:', highlightedMessages.length, highlightedMessages.map(m => m.senderName));
          }
        },
        error: (error) => {
          this.error = 'Error al cargar los mensajes';
          this.loading = false;
          console.error('Error loading messages:', error);
        }
      });

    // Load unread count (solo mensajes recibidos)
    // Para organizaciones, contar mensajes recibidos por cualquiera de los IDs
    this.messageService.getMessages()
      .pipe(
        takeUntil(this.destroy$),
        map(messages => {
          const unreadMessages = messages.filter(msg => 
            recipientIds.includes(msg.recipientId) && msg.isUnread()
          );
          return unreadMessages.length;
        })
      )
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  markAsRead(messageId: string) {
    this.messageService.markAsRead(messageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Message marked as read:', messageId);
        },
        error: (error) => {
          console.error('Error marking message as read:', error);
        }
      });
  }

  markAllAsRead() {
    const userId = this.currentUser?.id || '1';
    this.messages.forEach(message => {
      if (message.isUnread() && message.recipientId === userId) {
        this.markAsRead(message.id);
      }
    });
    this.unreadCount = 0;
  }

  deleteMessage(messageId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      this.messageService.deleteMessage(messageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Message deleted:', messageId);
          },
          error: (error) => {
            console.error('Error deleting message:', error);
            alert('Error al eliminar el mensaje');
          }
        });
    }
  }

  retry() {
    this.loadMessages();
  }

  private loadVolunteers() {
    // Refrescar la lista de voluntarios antes de cargar
    this.volunteerService.refreshVolunteers();
    
    this.volunteerService.getVolunteers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (volunteers: Volunteer[]) => {
          // Filtrar solo voluntarios (no admins) y excluir el usuario actual
          const currentUserId = this.currentUser?.id;
          this.volunteers = volunteers.filter(v => 
            v.role === 'volunteer' && v.id !== currentUserId
          );
          console.log('Voluntarios cargados:', this.volunteers.length, this.volunteers.map(v => v.name));
        },
        error: (error: any) => {
          console.error('Error loading volunteers:', error);
        }
      });
  }

  private loadOrganizations() {
    this.organizationService.getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organizations: Organization[]) => {
          this.organizations = organizations;
        },
        error: (error: any) => {
          console.error('Error loading organizations:', error);
        }
      });
  }

  toggleSendForm() {
    if (this.showSendForm) {
      // Cerrar el formulario y navegar a /mensajes
      this.selectedRecipients.clear();
      this.messageForm.reset();
      this.router.navigate(['/mensajes']);
    } else {
      // Abrir el formulario y navegar a la ruta correspondiente según el tipo de usuario
      this.selectedMessage = null;
      this.replyForm.reset();
      if (this.isVolunteerMode) {
        // Voluntarios: navegar a /mensajes/formulario
        this.router.navigate(['/mensajes/formulario']);
      } else {
        // Organizaciones: navegar a /mensajes/formulario-voluntarios
        this.router.navigate(['/mensajes/formulario-voluntarios']);
      }
    }
  }

  toggleRecipientSelection(recipientId: string) {
    if (this.selectedRecipients.has(recipientId)) {
      this.selectedRecipients.delete(recipientId);
    } else {
      this.selectedRecipients.add(recipientId);
    }
  }

  isRecipientSelected(recipientId: string): boolean {
    return this.selectedRecipients.has(recipientId);
  }

  selectAllRecipients() {
    const recipients = this.isVolunteerMode ? this.organizations : this.volunteers;
    if (this.selectedRecipients.size === recipients.length) {
      this.selectedRecipients.clear();
    } else {
      recipients.forEach(r => this.selectedRecipients.add(r.id));
    }
  }

  get selectedCount(): number {
    return this.selectedRecipients.size;
  }

  get allRecipientsSelected(): boolean {
    const recipients = this.isVolunteerMode ? this.organizations : this.volunteers;
    return recipients.length > 0 && this.selectedRecipients.size === recipients.length;
  }

  get availableRecipients(): (Volunteer | Organization)[] {
    return this.isVolunteerMode ? this.organizations : this.volunteers;
  }

  sendMessageToRecipients() {
    if (this.messageForm.valid && this.selectedRecipients.size > 0 && !this.sending && this.currentUser) {
      this.sending = true;
      this.error = null;

      const formData = this.messageForm.value;
      const senderId = this.currentUser.id;
      const senderName = this.currentUser.name;
      const senderIcon = this.currentUser.avatar || '/assets/mundo.png';

      // Construir el contenido del mensaje con URL si existe
      let messageContent = `${formData.subject}\n\n${formData.content}`;
      if (formData.url) {
        messageContent += `\n\n🔗 Enlace: ${formData.url}`;
      }

      // Si el remitente es una organización, obtener el nombre de la organización primero
      const getOrganizationName$ = !this.isVolunteerMode
        ? this.organizationService.getOrganizations().pipe(
            map(organizations => {
              // Buscar organización por email del usuario
              let userOrg = organizations.find(org => 
                org.email.toLowerCase().trim() === this.currentUser?.email.toLowerCase().trim()
              );
              
              // Si no se encuentra por email, buscar por nombre en el bio
              if (!userOrg && this.currentUser?.bio) {
                const bioMatch = this.currentUser.bio.match(/organización:\s*(.+)/i);
                if (bioMatch && bioMatch[1]) {
                  const orgNameFromBio = bioMatch[1].trim();
                  userOrg = organizations.find(org => 
                    org.name.toLowerCase().trim() === orgNameFromBio.toLowerCase()
                  );
                  return userOrg?.name || orgNameFromBio;
                }
              }
              return userOrg?.name;
            })
          )
        : of(undefined);

      // Enviar mensaje a cada destinatario seleccionado
      getOrganizationName$.pipe(
        switchMap(senderOrganization => {
      const sendObservables: Observable<Message>[] = [];
          const notificationObservables: Observable<any>[] = [];
          
          Array.from(this.selectedRecipients).forEach(recipientId => {
            const recipient = this.isVolunteerMode 
              ? this.organizations.find(o => o.id === recipientId)
              : this.volunteers.find(v => v.id === recipientId);
            
            if (!recipient) return;

            const messageData: any = {
              senderId: senderId,
              senderName: senderName,
              senderIcon: senderIcon,
              recipientId: recipientId,
              content: messageContent,
              type: 'general',
              senderOrganization: senderOrganization // Incluir el nombre de la organización si existe
            };

            console.log('Creating message:', {
              senderId: senderId,
              senderName: senderName,
              senderOrganization: senderOrganization,
              recipientId: recipientId,
              recipientName: recipient.name,
              isVolunteerMode: this.isVolunteerMode
            });

            sendObservables.push(this.messageService.sendMessage(messageData));

            // Si el destinatario es una organización, buscar el userId del usuario de la organización
            if (this.isVolunteerMode) {
              // En modo voluntario, el recipient es una Organization
              const orgRecipient = recipient as Organization;
              // Obtener la organización del backend para obtener el userId
              const notificationObservable = this.apiService.get<any>(`organizations/${recipientId}`)
                .pipe(
                  switchMap(org => {
                    // El backend devuelve el userId de la organización
                    const orgUserId = org.userId;
                    console.log('Creating notification for organization user:', {
                      organizationId: recipientId,
                      organizationUserId: orgUserId,
                      organizationName: org.name,
                      organizationEmail: org.email
                    });
                    
                    if (!orgUserId) {
                      console.warn('Organization does not have userId, trying to find user by email');
                      // Fallback: buscar usuario por email
                      return this.apiService.get<User[]>('users').pipe(
                        map(users => {
                          const orgUser = users.find(u => 
                            u.role === 'organization_admin' && 
                            u.email.toLowerCase() === orgRecipient.email.toLowerCase()
                          );
                          return orgUser?.id || String(orgUserId || recipientId);
                        })
                      );
                    }
                    return of(String(orgUserId));
                  }),
                  switchMap(orgUserId => {
                    return this.notificationService.createNotification({
                      userId: String(orgUserId),
                      title: 'Nuevo mensaje',
                      message: `${senderName} te envió un mensaje: ${formData.subject}`,
                      type: 'new_message' as const,
                      actionUrl: '/mensajes'
                    });
                  }),
                  catchError((error) => {
                    console.error('Error creating notification for organization:', error);
                    return of(null); // Continuar aunque falle la notificación
                  }),
                  takeUntil(this.destroy$)
                );
              notificationObservables.push(notificationObservable);
            } else {
              // Si el destinatario es un voluntario, usar el recipientId directamente
              // El recipientId debería ser el userId del voluntario
              // Asegurarse de que el recipientId sea el id del voluntario (que es el userId)
              const volunteerRecipient = recipient as Volunteer;
              const volunteerUserId = volunteerRecipient.id; // El id del voluntario es su userId
              
              console.log('Creating notification for volunteer:', {
                recipientId: recipientId,
                volunteerUserId: volunteerUserId,
                recipientName: recipient.name,
                recipientType: recipient.constructor.name,
                volunteerId: volunteerRecipient.id
              });
              
              notificationObservables.push(
                this.notificationService.createNotification({
                  userId: String(volunteerUserId), // Asegurar que sea string y usar el id del voluntario
                  title: 'Nuevo mensaje',
                  message: `${senderName}${senderOrganization ? ` (${senderOrganization})` : ''} te envió un mensaje: ${formData.subject}`,
                  type: 'new_message' as const,
                  actionUrl: '/mensajes'
                }).pipe(
                  tap(createdNotification => {
                    console.log('✅ Notification created successfully for volunteer:', {
                      notificationId: createdNotification.id,
                      userId: createdNotification.userId,
                      userIdType: typeof createdNotification.userId,
                      volunteerUserId: volunteerUserId,
                      volunteerUserIdType: typeof volunteerUserId,
                      title: createdNotification.title
                    });
                  }),
                  catchError(error => {
                    console.error('❌ Error creating notification for volunteer:', {
                      recipientId: recipientId,
                      volunteerUserId: volunteerUserId,
                      error: error
                    });
                    return of(null); // Continuar aunque falle la notificación
                  })
                )
              );
            }
          });

          // Usar forkJoin para enviar todos los mensajes y notificaciones en paralelo
          console.log('Sending messages and notifications:', sendObservables.length, 'messages,', notificationObservables.length, 'notifications');
          return forkJoin([...sendObservables, ...notificationObservables]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
          next: () => {
            this.sending = false;
            const recipientType = this.isVolunteerMode ? 'organización(es)' : 'voluntario(s)';
            alert(`Mensaje enviado exitosamente a ${this.selectedRecipients.size} ${recipientType}`);
            this.selectedRecipients.clear();
            this.messageForm.reset();
            // Navegar de vuelta a /mensajes
            this.router.navigate(['/mensajes']);
            // Recargar mensajes después de un breve delay
            setTimeout(() => {
              console.log('Refreshing messages after send...');
              this.messageService.refreshMessages();
              setTimeout(() => {
                console.log('Reloading messages...');
                this.loadMessages();
            }, 1000);
            }, 1500);
          },
          error: (error) => {
            this.sending = false;
            this.error = 'Error al enviar algunos mensajes: ' + (error.message || 'Error desconocido');
            console.error('Error sending messages:', error);
          }
        });
    } else {
      if (this.selectedRecipients.size === 0) {
        const recipientType = this.isVolunteerMode ? 'organización' : 'voluntario';
        this.error = `Por favor selecciona al menos una ${recipientType}`;
      } else {
        this.messageForm.markAllAsTouched();
        this.error = 'Por favor completa todos los campos requeridos';
      }
    }
  }

  /**
   * Handle message click to show message view
   */
  onMessageClick(message: Message) {
    console.log('Message clicked:', message);
    this.selectedMessage = message;
    
    // Si el mensaje no tiene senderOrganization pero el remitente es una organización,
    // intentar obtener el nombre de la organización dinámicamente
    if (!message.senderOrganization && !this.isVolunteerMode) {
      // El mensaje fue enviado por el usuario actual (organización)
      // Obtener el nombre de la organización del usuario actual
      this.organizationService.getOrganizations()
        .pipe(takeUntil(this.destroy$))
        .subscribe(organizations => {
          const userOrg = organizations.find(org => 
            org.email.toLowerCase().trim() === this.currentUser?.email.toLowerCase().trim()
          );
          
          if (userOrg) {
            // Actualizar el mensaje con el nombre de la organización
            message.senderOrganization = userOrg.name;
            this.selectedMessage = message;
          } else if (this.currentUser?.bio) {
            // Intentar extraer del bio como fallback
            const bioMatch = this.currentUser.bio.match(/organización:\s*(.+)/i);
            if (bioMatch && bioMatch[1]) {
              message.senderOrganization = bioMatch[1].trim();
              this.selectedMessage = message;
            }
          }
        });
    } else if (!message.senderOrganization && this.isVolunteerMode) {
      // El mensaje fue enviado por otra organización al usuario actual (voluntario)
      // Buscar la organización del remitente basándose en el senderId (userId del representante)
      forkJoin({
        organizations: this.organizationService.getOrganizations(),
        users: this.apiService.get<User[]>('users')
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ organizations, users }) => {
          // Buscar el usuario remitente
          const senderUser = users.find(u => u.id === message.senderId);
          
          if (senderUser && senderUser.role === 'organization_admin') {
            // Buscar la organización del usuario remitente por email
            const senderOrg = organizations.find(org => 
              org.email.toLowerCase().trim() === senderUser.email.toLowerCase().trim()
            );
            
            if (senderOrg) {
              message.senderOrganization = senderOrg.name;
              this.selectedMessage = message;
            } else if (senderUser.bio) {
              // Intentar extraer del bio del usuario remitente
              const bioMatch = senderUser.bio.match(/organización:\s*(.+)/i);
              if (bioMatch && bioMatch[1]) {
                const orgNameFromBio = bioMatch[1].trim();
                const foundOrg = organizations.find(org => 
                  org.name.toLowerCase().trim() === orgNameFromBio.toLowerCase()
                );
                message.senderOrganization = foundOrg?.name || orgNameFromBio;
                this.selectedMessage = message;
              }
            }
          }
        });
    }
    
    console.log('Selected message set:', this.selectedMessage);
    
    // Marcar mensaje como leído
    if (message.isUnread()) {
      this.messageService.markAsRead(message.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedMessage) => {
            // Actualizar el mensaje en la lista con el mensaje actualizado del servicio
            const index = this.messages.findIndex(m => m.id === message.id);
            if (index !== -1) {
              this.messages[index] = updatedMessage;
              // Actualizar también el mensaje seleccionado
              if (this.selectedMessage && this.selectedMessage.id === updatedMessage.id) {
                this.selectedMessage = updatedMessage;
              }
            }
            // Recalcular el contador de no leídos
            this.unreadCount = this.messages.filter(msg => msg.isUnread()).length;
          },
          error: (error) => {
            console.error('Error marking message as read:', error);
          }
        });
    }
  }

  /**
   * Close message view
   */
  closeMessageView() {
    this.selectedMessage = null;
    this.replyForm.reset();
  }

  /**
   * Send reply to message
   */
  sendReply() {
    if (this.replyForm.valid && this.selectedMessage && !this.sendingReply) {
      this.sendingReply = true;
      const userId = this.currentUser?.id || '1';
      const replyContent = this.replyForm.value.content.trim();
      
      // Crear mensaje de respuesta
      const replyMessage: Partial<Message> = {
        senderId: userId,
        senderName: this.currentUser?.name || 'Usuario',
        senderIcon: this.currentUser?.avatar || '/assets/mundo.png',
        recipientId: this.selectedMessage.senderId,
        content: replyContent,
        type: 'general'
      };

      this.messageService.sendMessage(replyMessage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (sentMessage) => {
            console.log('Reply sent successfully:', sentMessage);
            this.sendingReply = false;
            this.replyForm.reset();
            
            // Cerrar vista después de un breve delay
            setTimeout(() => {
              this.closeMessageView();
              // Recargar mensajes
              this.loadMessages();
            }, 500);
          },
          error: (error) => {
            console.error('Error sending reply:', error);
            this.sendingReply = false;
            alert('Error al enviar la respuesta. Por favor intenta nuevamente.');
          }
        });
    }
  }
}

