import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../communication/domain/model/message';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css'
})
export class MessageListComponent implements OnInit {
  @Input() messages: Message[] | null = [];
  @Input() highlightSender: string | null = null;
  @Output() messageClick = new EventEmitter<Message>();

  ngOnInit() {
    // Component initialization
  }

  /**
   * Check if a message should be highlighted
   */
  isHighlighted(message: Message): boolean {
    if (!this.highlightSender) return false;
    
    // Comparar el nombre del remitente (case insensitive)
    const senderName = this.getSenderName(message).toLowerCase().trim();
    const highlightName = this.highlightSender.toLowerCase().trim();
    
    // Comparaciones más flexibles
    if (senderName === highlightName) {
      return true;
    }
    
    // Verificar si uno contiene al otro
    if (senderName.includes(highlightName) || highlightName.includes(senderName)) {
      return true;
    }
    
    // Verificar si los nombres coinciden sin espacios extra
    const senderWords = senderName.split(/\s+/).filter(w => w.length > 0);
    const highlightWords = highlightName.split(/\s+/).filter(w => w.length > 0);
    
    // Si al menos el primer nombre coincide
    if (senderWords.length > 0 && highlightWords.length > 0) {
      if (senderWords[0] === highlightWords[0]) {
        return true;
      }
    }
    
    return false;
  }

  getSenderName(message: Message): string {
    const senderName = message.senderName || 'Usuario desconocido';
    // Si el mensaje tiene información de organización, agregarla
    if (message.senderOrganization) {
      return `${senderName} (${message.senderOrganization})`;
    }
    return senderName;
  }

  getSenderIcon(message: Message): string {
    return message.senderIcon || 'fa-solid fa-user';
  }

  isImageUrl(icon: string | undefined): boolean {
    if (!icon) return false;
    // Verificar si es una URL (http, https, /) o una imagen base64
    return icon.startsWith('http://') || 
           icon.startsWith('https://') || 
           icon.startsWith('/') ||
           icon.startsWith('data:image/');
  }

  onImageError(event: Event, message: Message) {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback a imagen por defecto
      img.src = '/assets/mundo.png';
    }
  }

  getIconClass(message: Message): string {
    const senderName = this.getSenderName(message);
    
    if (senderName.includes('Juventud Solidaria')) {
      return 'border-red-200';
    } else if (senderName.includes('Manos Verdes')) {
      return 'border-green-200';
    } else if (senderName.includes('Tú') || senderName.includes('Usuario')) {
      return 'border-blue-200';
    } else {
      return 'border-gray-200';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }

  onMessageClick(message: Message) {
    this.messageClick.emit(message);
  }
}

