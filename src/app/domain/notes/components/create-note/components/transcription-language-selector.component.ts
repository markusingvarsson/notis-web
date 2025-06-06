import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transcription-language-selector',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transcription-language-selector.component.html',
  styleUrl: './transcription-language-selector.component.scss',
})
export class TranscriptionLanguageSelectorComponent {
  selectedLanguage = model<string | null>();

  readonly languages = [
    { name: 'No transcription', value: null },
    { name: 'English', value: 'en-US' },
    { name: 'Swedish', value: 'sv-SE' },
  ];
}
