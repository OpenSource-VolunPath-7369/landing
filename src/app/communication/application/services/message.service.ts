import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { Message } from '../../domain/model/message';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

/**
 * Application service for managing messages.
 * 
 * @remarks
 * This service handles message-related operations in the Communication bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private usersCache: User[] = [];

  constructor(private apiService: ApiService) {
    this.loadMessages();
    this.loadUsers();
  }

  private loadUsers(): void {
    this.apiService.get<User[]>('users').subscribe(
      users => {
        this.usersCache = users;
      }
    );
  }

  private getUserById(userId: string): User | null {
    return this.usersCache.find(u => u.id === userId) || null;
  }

  private loadMessages(): void {
    // El backend no tiene un endpoint para obtener todos los mensajes
    // Solo se pueden obtener por userId, así que no cargamos aquí
    // Se cargarán cuando se llame a getMessagesByUserId
  }

  private mapToMessage(data: any): Message {
    // Buscar el usuario en el cache para obtener su avatar
    const user = this.getUserById(String(data.senderId));
    const senderIcon = data.senderIcon || user?.avatar || '/assets/mundo.png';
    const senderName = data.senderName || user?.name || 'Usuario desconocido';

    // Handle isRead field - backend returns isRead as Boolean
    const isRead = data.isRead !== undefined ? Boolean(data.isRead) : 
                   (data.is_read !== undefined ? Boolean(data.is_read) : false);

    // Handle timestamp - backend returns createdAt as LocalDateTime (ISO string)
    let timestamp = new Date().toISOString();
    if (data.createdAt) {
      // Backend returns LocalDateTime which should be in ISO format
      timestamp = data.createdAt;
    } else if (data.timestamp) {
      timestamp = data.timestamp;
    } else if (data.updatedAt) {
      timestamp = data.updatedAt;
    }

    const message = new Message(
      String(data.id),
      String(data.senderId),
      senderName,
      senderIcon,
      String(data.recipientId),
      data.content || '',
      timestamp,
      isRead,
      this.mapBackendMessageTypeToFrontend(data.type),
      data.senderOrganization // Incluir el nombre de la organización si existe
    );
    return message;
  }

  getMessages(): Observable<Message[]> {
    return this.messages$;
  }

  getMessageById(id: string): Observable<Message> {
    return this.apiService.get<any>(`messages/${id}`).pipe(
      map(msg => this.mapToMessage(msg))
    );
  }

  getMessagesByUserId(userId: string): Observable<Message[]> {
    console.log('💬 MessageService: Getting messages for userId:', userId, 'Type:', typeof userId);
    // Asegurar que tenemos los usuarios cargados
    return this.apiService.get<User[]>('users').pipe(
      switchMap(users => {
        this.usersCache = users;
        console.log('💬 MessageService: Users loaded, fetching messages for userId:', userId);
        // El backend usa /messages/user/{userId}
        return this.apiService.get<any[]>(`messages/user/${userId}`);
      }),
      tap(rawMessages => {
        console.log('💬 MessageService: Raw messages from backend:', rawMessages);
        console.log('💬 MessageService: Messages count from backend:', rawMessages?.length || 0);
        if (rawMessages && rawMessages.length > 0) {
          rawMessages.forEach((msg, index) => {
            console.log(`💬 MessageService: Message ${index + 1}:`, {
              id: msg.id,
              senderId: msg.senderId,
              senderIdType: typeof msg.senderId,
              recipientId: msg.recipientId,
              recipientIdType: typeof msg.recipientId,
              senderName: msg.senderName,
              content: msg.content?.substring(0, 50),
              isRead: msg.isRead,
              type: msg.type
            });
          });
        } else {
          console.warn('💬 MessageService: ⚠️ No messages returned from backend for userId:', userId);
        }
      }),
      map(messages => {
        if (!messages || messages.length === 0) {
          console.warn('💬 MessageService: No messages to map');
          this.messagesSubject.next([]);
          return [];
        }
        const mappedMessages = messages.map(msg => {
          const mapped = this.mapToMessage(msg);
          console.log('💬 MessageService: Mapped message:', {
            id: mapped.id,
            senderId: mapped.senderId,
            recipientId: mapped.recipientId,
            senderName: mapped.senderName,
            isRead: mapped.isRead
          });
          return mapped;
        });
        console.log('💬 MessageService: Total mapped messages:', mappedMessages.length);
        this.messagesSubject.next(mappedMessages);
        return mappedMessages;
      })
    );
  }

  sendMessage(messageData: Partial<Message>): Observable<Message> {
    const newMessage = {
      senderId: Number(messageData.senderId),
      senderName: messageData.senderName,
      senderIcon: messageData.senderIcon,
      recipientId: Number(messageData.recipientId),
      content: messageData.content,
      type: this.mapFrontendMessageTypeToBackend(messageData.type || 'general'),
      senderOrganization: messageData.senderOrganization
    };

    return this.apiService.post<any>('messages', newMessage).pipe(
      map(msg => this.mapToMessage(msg)),
      tap(sentMessage => {
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([sentMessage, ...currentMessages]);
      })
    );
  }

  refreshMessages(): void {
    this.loadMessages();
  }

  markAsRead(messageId: string): Observable<Message> {
    // El backend usa PUT /messages/{id}/read
    return this.apiService.put<any>(`messages/${messageId}/read`, {}).pipe(
      map(msg => this.mapToMessage(msg)),
      tap(updatedMessage => {
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next(
          currentMessages.map(message => 
            message.id === messageId ? updatedMessage : message
          )
        );
      })
    );
  }

  deleteMessage(id: string): Observable<void> {
    return this.apiService.delete<void>(`messages/${id}`).pipe(
      tap(() => {
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next(
          currentMessages.filter(message => message.id !== id)
        );
      })
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return new Observable(observer => {
      this.messages$.subscribe(messages => {
        const unreadCount = messages.filter(
          message => message.recipientId === userId && message.isUnread()
        ).length;
        observer.next(unreadCount);
      });
    });
  }

  private mapBackendMessageTypeToFrontend(backendType: string): 'volunteer_inquiry' | 'activity_details' | 'confirmation' | 'thank_you' | 'general' {
    const typeMap: { [key: string]: 'volunteer_inquiry' | 'activity_details' | 'confirmation' | 'thank_you' | 'general' } = {
      'VOLUNTEER_INQUIRY': 'volunteer_inquiry',
      'ACTIVITY_DETAILS': 'activity_details',
      'CONFIRMATION': 'confirmation',
      'THANK_YOU': 'thank_you',
      'GENERAL': 'general'
    };
    return typeMap[backendType] || 'general';
  }

  private mapFrontendMessageTypeToBackend(frontendType: string): string {
    const typeMap: { [key: string]: string } = {
      'volunteer_inquiry': 'VOLUNTEER_INQUIRY',
      'activity_details': 'ACTIVITY_DETAILS',
      'confirmation': 'CONFIRMATION',
      'thank_you': 'THANK_YOU',
      'general': 'GENERAL'
    };
    return typeMap[frontendType] || 'GENERAL';
  }
}

