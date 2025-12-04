import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.loadFAQs();
    // Recargar FAQs cuando cambie el idioma
    this.translate.onLangChange.subscribe(() => {
      this.loadFAQs();
    });
  }

  loadFAQs() {
    this.faqs = [
      {
        id: '1',
        question: this.translate.instant('support.faqs.q1'),
        answer: this.translate.instant('support.faqs.a1'),
        isExpanded: false
      },
      {
        id: '2',
        question: this.translate.instant('support.faqs.q2'),
        answer: this.translate.instant('support.faqs.a2'),
        isExpanded: false
      },
      {
        id: '3',
        question: this.translate.instant('support.faqs.q3'),
        answer: this.translate.instant('support.faqs.a3'),
        isExpanded: false
      },
      {
        id: '4',
        question: this.translate.instant('support.faqs.q4'),
        answer: this.translate.instant('support.faqs.a4'),
        isExpanded: false
      },
      {
        id: '5',
        question: this.translate.instant('support.faqs.q5'),
        answer: this.translate.instant('support.faqs.a5'),
        isExpanded: false
      },
      {
        id: '6',
        question: this.translate.instant('support.faqs.q6'),
        answer: this.translate.instant('support.faqs.a6'),
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
