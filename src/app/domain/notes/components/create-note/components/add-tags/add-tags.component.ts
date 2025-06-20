import {
  Component,
  computed,
  input,
  model,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonComponent } from '../../../../../../components/ui/button/button.component';
import { FormsModule } from '@angular/forms';
import { Tag } from '../../../..';

@Component({
  selector: 'app-add-tags',
  imports: [ButtonComponent, FormsModule],
  templateUrl: './add-tags.component.html',
  styleUrl: './add-tags.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTagsComponent {
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
