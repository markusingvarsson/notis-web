import { Component, input, output } from '@angular/core';
import { NoteType } from '../../../../index';

@Component({
  selector: 'app-save-mode-picker',
  standalone: true,
  imports: [],
  templateUrl: './save-mode-picker.component.html',
  styleUrls: ['./save-mode-picker.component.scss'],
})
export class SaveModePickerComponent {
  currentSaveMode = input.required<NoteType>();
  saveModeChange = output<NoteType>();

  onModeChange(mode: string): void {
    this.saveModeChange.emit(mode as NoteType);
  }
}
