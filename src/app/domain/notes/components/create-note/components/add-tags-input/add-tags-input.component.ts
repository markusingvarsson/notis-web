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
  noteTags = model<Record<string, Tag>>({});
  noteTagsAsArray = computed(() => Object.values(this.noteTags()));
  currentTag = model<string>('');
  disabled = computed(() => {
    return !this.currentTag() || Boolean(this.noteTags()[this.currentTag()]);
  });
  availableTags = input<Record<string, Tag>>({});
  availableTagsAsArray = computed(() => {
    return Object.values(this.availableTags()).filter(
      (tag) => !this.noteTags()[tag.id]
    );
  });

  constructor() {
    effect(() => {
      console.log(this.availableTags());
    });
  }
  addTag(tagStr: string) {
    this.noteTags.set({
      ...this.noteTags(),
      [tagStr]: {
        name: tagStr,
        id: tagStr,
        updatedAt: new Date().toISOString(),
      },
    });
    this.currentTag.set('');
  }

  removeTag(tagToRemove: Tag) {
    const newTags = { ...this.noteTags() };
    delete newTags[tagToRemove.id];
    this.noteTags.set(newTags);
  }
}
