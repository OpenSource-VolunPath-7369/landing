import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { MessageService } from '../../communication/application/services/message.service';
import { Message } from '../../interfaces';
import { AuthService } from '../../auth/application/services/auth.service';

@Component({
  selector: 'app-mensajes-page',
  standalone: true,
  imports: [CommonModule, MessageListComponent],
  templateUrl: './mensajes-page.component.html',
  styleUrls: ['./mensajes-page.component.css']
})
export default class MensajesPageComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  loading = false;
  error: string | null = null;
  unreadCount = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMessages() {
    this.loading = true;
    this.error = null;

    // Get current authenticated user ID
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      console.error('No authenticated user found');
      return;
    }

    const userId = currentUser.id;
    console.log('Loading messages for user:', userId);
    
    this.messageService.getMessagesByUserId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          console.log('Messages loaded:', messages);
          console.log('Messages count:', messages.length);
          // Sort messages by timestamp (newest first)
          this.messages = messages.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los mensajes';
          this.loading = false;
          console.error('Error loading messages:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        }
      });

    // Load unread count
    this.messageService.getUnreadCount(userId)
      .pipe(takeUntil(this.destroy$))
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
          // Update local message state
          const message = this.messages.find(m => m.id === messageId);
          if (message) {
            message.markAsRead();
          }
          // Reload messages to ensure sync
          this.loadMessages();
        },
        error: (error) => {
          console.error('Error marking message as read:', error);
        }
      });
  }

  markAllAsRead() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('No authenticated user found');
      return;
    }
    
    // Mark all unread messages as read individually
    const unreadMessages = this.messages.filter(m => 
      m.recipientId === currentUser.id && m.isUnread()
    );
    
    if (unreadMessages.length === 0) {
      console.log('No unread messages to mark');
      return;
    }
    
    // Mark each message as read
    unreadMessages.forEach(message => {
      this.markAsRead(message.id);
    });
    
    // Update unread count after a short delay
    setTimeout(() => {
      this.unreadCount = 0;
    }, 500);
  }

  deleteMessage(messageId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      this.messageService.deleteMessage(messageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Message deleted:', messageId);
            // Reload messages after deletion
            this.loadMessages();
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
}
