import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FAQ } from '../../interfaces/faq.interface';

@Component({
  selector: 'app-soporte-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './soporte-page.component.html',
  styleUrls: ['./soporte-page.component.css']
})
export default class SoportePageComponent implements OnInit {
  faqs: FAQ[] = [];

  ngOnInit() {
    this.loadFAQs();
  }

  loadFAQs() {
    this.faqs = [
      {
        id: '1',
        question: '¿Dónde encuentro las tareas y roles asignados dentro de mi voluntariado?',
        answer: 'Puedes encontrar las tareas y roles asignados en la sección "Dashboard" de tu perfil. Allí verás un resumen de todas las actividades que tienes pendientes y las responsabilidades que se te han asignado.',
        isExpanded: false
      },
      {
        id: '2',
        question: '¿Cómo funciona la barra de opciones del dashboard?',
        answer: 'La barra de opciones del dashboard te permite navegar rápidamente entre las diferentes secciones de la plataforma. Cada opción te lleva a una funcionalidad específica como mensajes, notificaciones, perfil, etc.',
        isExpanded: false
      },
      {
        id: '3',
        question: '¿De qué forma puedo acceder rápidamente a mis mensajes directos?',
        answer: 'Puedes acceder a tus mensajes directos haciendo clic en el ícono de mensajes en la barra lateral o navegando directamente a la sección "Mensajes" desde el menú principal.',
        isExpanded: false
      },
      {
        id: '4',
        question: '¿El sistema de notificaciones me permite filtrar entre actividades, mensajes y alertas de proyectos?',
        answer: 'Sí, el sistema de notificaciones incluye filtros que te permiten organizar y ver solo el tipo de notificaciones que te interesan: actividades, mensajes, alertas de proyectos, etc.',
        isExpanded: false
      },
      {
        id: '5',
        question: '¿Dónde y cómo puedo editar la información de mi perfil?',
        answer: 'Para editar tu información de perfil, ve a la sección "Perfil" y haz clic en el botón "Editar información de perfil". Allí podrás actualizar todos tus datos personales y de la organización.',
        isExpanded: false
      },
      {
        id: '6',
        question: '¿Cómo se organiza la sección de Comunidad y qué puedo hacer allí?',
        answer: 'La sección de Comunidad está organizada por categorías de voluntariado y te permite conectar con otros voluntarios, ver proyectos disponibles, participar en discusiones y colaborar en iniciativas sociales.',
        isExpanded: false
      }
    ];
  }

  toggleFAQ(faq: FAQ) {
    faq.isExpanded = !faq.isExpanded;
  }

  contactWhatsApp() {
    // Número de WhatsApp de soporte (puedes cambiarlo por el real)
    const phoneNumber = '51987654321'; // Reemplaza con el número real
    const message = 'Hola, necesito ayuda con la plataforma Volunpath';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  trackByFn(index: number, item: FAQ): string {
    return item.id;
  }
}
