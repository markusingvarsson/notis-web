import { Component, model } from '@angular/core';
import { Tag } from '.';
import { ButtonComponent } from '../../../../../../components/ui/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-tags-input',
  imports: [ButtonComponent, FormsModule],
  templateUrl: './add-tags-input.component.html',
  styleUrl: './add-tags-input.component.scss',
})
export class AddTagsInputComponent {
  tags = model<Tag[]>([]);
  tagInput = model<string>('');

  addTag() {
    this.tags.set([
      ...this.tags(),
      { name: this.tagInput(), value: this.tagInput() },
    ]);
    this.tagInput.set('');
  }
}
