import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-name-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './note-name-input.component.html',
  styleUrl: './note-name-input.component.scss',
})
export class NoteNameInputComponent {
  noteName = model<string>();
}
