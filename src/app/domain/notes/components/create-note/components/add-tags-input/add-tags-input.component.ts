import { Component, computed, effect, input, model } from '@angular/core';
import { ButtonComponent } from '../../../../../../components/ui/button/button.component';
import { FormsModule } from '@angular/forms';
import { Tag } from '.';

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
  availableTags = input<Record<string, Tag>>({});
  availableTagsAsArray = computed(() => Object.values(this.availableTags()));

  constructor() {
    effect(() => {
      console.log(this.availableTags());
    });
  }
  addTag(tagStr: string) {
    this.tags.set({
      ...this.tags(),
      [tagStr]: {
        name: tagStr,
        id: tagStr,
        updatedAt: new Date().toISOString(),
      },
    });
    this.tagInput.set('');
  }

  removeTag(tagToRemove: Tag) {
    const newTags = { ...this.tags() };
    delete newTags[tagToRemove.id];
    this.tags.set(newTags);
  }
}
