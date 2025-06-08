import {
  Component,
  computed,
  effect,
  input,
  model,
  signal,
} from '@angular/core';
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
  isExpanded = signal(false);
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
  topThreeMostRecentlyUsedTags = computed(() => {
    return this.availableTagsAsArray()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3);
  });

  constructor() {
    effect(() => {
      console.log(this.availableTags());
    });
  }
  addTag(tagStr: string) {
    if (!tagStr) return;

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

  toggleExpanded() {
    this.isExpanded.set(!this.isExpanded());
  }
}
