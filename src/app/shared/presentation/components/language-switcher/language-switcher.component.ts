import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonToggle, MatButtonToggleGroup, MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent {
  currentLang = 'es';
  languages = ['es', 'en'];

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('selectedLanguage') || 'es';
    this.currentLang = this.translate.getCurrentLang() || savedLang;
    if (savedLang && savedLang !== this.currentLang) {
      this.translate.use(savedLang);
      this.currentLang = savedLang;
    }
  }

  onLanguageChange(event: MatButtonToggleChange) {
    const selectedLang = event.value;
    if (selectedLang && selectedLang !== this.currentLang) {
      this.useLanguage(selectedLang);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
    this.currentLang = language;
    localStorage.setItem('selectedLanguage', language);
  }
}

