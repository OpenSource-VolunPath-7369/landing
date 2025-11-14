import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

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
    this.currentLang = this.translate.getCurrentLang() || 'es';
  }

  useLanguage(language: string) {
    this.translate.use(language);
    this.currentLang = language;
    localStorage.setItem('selectedLanguage', language);
  }
}

