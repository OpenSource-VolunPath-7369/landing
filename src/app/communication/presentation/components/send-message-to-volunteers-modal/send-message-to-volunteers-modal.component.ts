import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { VolunteerService } from '../../../../volunteers/application/services/volunteer.service';
import { MessageService } from '../../../application/services/message.service';
import { Volunteer } from '../../../../volunteers/domain/model/volunteer';
import { Message } from '../../../domain/model/message';

@Component({
  selector: 'app-send-message-to-volunteers-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './send-message-to-volunteers-modal.component.html',
  styleUrls: ['./send-message-to-volunteers-modal.component.css']
})
export default class SendMessageToVolunteersModalComponent implements OnInit, OnDestroy {
  messageForm: FormGroup;
  volunteers: Volunteer[] = [];
  selectedVolunteers: Set<string> = new Set();
  loading = false;
  sending = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<SendMessageToVolunteersModalComponent>,
    private fb: FormBuilder,
    private volunteerService: VolunteerService,
    private messageService: MessageService
  ) {
    this.messageForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      url: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  ngOnInit() {
    this.loadVolunteers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVolunteers() {
    this.loading = true;
    this.volunteerService.getVolunteers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (volunteers: Volunteer[]) => {
          // Filtrar solo voluntarios (no admins)
          this.volunteers = volunteers.filter(v => v.role === 'volunteer');
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al cargar los voluntarios';
          this.loading = false;
          console.error('Error loading volunteers:', error);
        }
      });
  }

  toggleVolunteerSelection(volunteerId: string) {
    if (this.selectedVolunteers.has(volunteerId)) {
      this.selectedVolunteers.delete(volunteerId);
    } else {
      this.selectedVolunteers.add(volunteerId);
    }
  }

  isVolunteerSelected(volunteerId: string): boolean {
    return this.selectedVolunteers.has(volunteerId);
  }

  selectAll() {
    if (this.selectedVolunteers.size === this.volunteers.length) {
      this.selectedVolunteers.clear();
    } else {
      this.volunteers.forEach(v => this.selectedVolunteers.add(v.id));
    }
  }

  get selectedCount(): number {
    return this.selectedVolunteers.size;
  }

  get allSelected(): boolean {
    return this.volunteers.length > 0 && this.selectedVolunteers.size === this.volunteers.length;
  }

  onSubmit() {
    if (this.messageForm.valid && this.selectedVolunteers.size > 0 && !this.sending) {
      this.sending = true;
      this.error = null;

      const formData = this.messageForm.value;
      const senderId = '1'; // Mock sender ID (en producción vendría del usuario autenticado)
      const senderName = 'Manos Verdes ONG'; // Mock sender name
      const senderIcon = '/assets/mundo.png'; // Mock sender icon

      // Enviar mensaje a cada voluntario seleccionado
      const sendObservables: Observable<Message>[] = [];
      
      Array.from(this.selectedVolunteers).forEach(volunteerId => {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        if (!volunteer) return;

        // Construir el contenido del mensaje con URL si existe
        let messageContent = `${formData.subject}\n\n${formData.content}`;
        if (formData.url) {
          messageContent += `\n\n🔗 Enlace: ${formData.url}`;
        }

        const messageData: Partial<Message> = {
          senderId: senderId,
          senderName: senderName,
          senderIcon: senderIcon,
          recipientId: volunteerId,
          content: messageContent,
          type: 'general'
        };

        sendObservables.push(this.messageService.sendMessage(messageData));
      });

      // Usar forkJoin para enviar todos los mensajes en paralelo
      forkJoin(sendObservables)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.sending = false;
            alert(`Mensaje enviado exitosamente a ${this.selectedVolunteers.size} voluntario(s)`);
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.sending = false;
            this.error = 'Error al enviar algunos mensajes: ' + (error.message || 'Error desconocido');
            console.error('Error sending messages:', error);
          }
        });
    } else {
      if (this.selectedVolunteers.size === 0) {
        this.error = 'Por favor selecciona al menos un voluntario';
      } else {
        this.messageForm.markAllAsTouched();
        this.error = 'Por favor completa todos los campos requeridos';
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}

