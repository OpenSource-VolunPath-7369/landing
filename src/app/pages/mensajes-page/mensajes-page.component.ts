import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { MessageService } from '../../services/message.service';
import { Message } from '../../interfaces';

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

  constructor(private messageService: MessageService) {}

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

    // Load messages for current user (mock user ID)
    const userId = '1';
    
    this.messageService.getMessagesByUserId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los mensajes';
          this.loading = false;
          console.error('Error loading messages:', error);
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
        },
        error: (error) => {
          console.error('Error marking message as read:', error);
        }
      });
  }

  markAllAsRead() {
    const userId = '1'; // Mock user ID
    
    this.messageService.markAllAsRead(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('All messages marked as read');
          this.unreadCount = 0;
        },
        error: (error) => {
          console.error('Error marking all messages as read:', error);
        }
      });
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
}
