import { Component, computed, model } from '@angular/core';
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
  tags = model<Record<string, Tag>>({});
  tagInput = model<string>('');
  tagsAsArray = computed(() => Object.values(this.tags()));

  disabled = computed(() => {
    return !this.tagInput() || Boolean(this.tags()[this.tagInput()]);
  });

  addTag() {
    this.tags.set({
      ...this.tags(),
      [this.tagInput()]: { name: this.tagInput(), id: this.tagInput() },
    });
    this.tagInput.set('');
  }

  removeTag(tagToRemove: Tag) {
    const newTags = { ...this.tags() };
    delete newTags[tagToRemove.id];
    this.tags.set(newTags);
  }
}
