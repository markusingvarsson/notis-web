import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../../domain/notes/components/note-list/note-list.component';
import { DesktopSidebarComponent } from '../../../components/layout/desktop-sidebar/desktop-sidebar.component';
import { TagFilterComponent } from '../../../domain/notes/components/tag-filter/tag-filter.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-notes-list-page',
  standalone: true,
  imports: [
    PagelayoutComponent,
    NoteListComponent,
    DesktopSidebarComponent,
    TagFilterComponent,
  ],
  template: `
    <app-pagelayout
      [pageTitle]="'My Notes - Notis.nu'"
      [pageDescription]="
        'A minimalist voice-first note-taking experience designed for clarity and focus.'
      "
      [pageKeywords]="
        'notes, voice notes, my notes, note management, notis, local storage, privacy'
      "
      [withFooter]="true"
      [withNavbar]="isMobile()"
      [fixedNavbar]="!isMobile()"
    >
      <app-desktop-sidebar>
        <app-tag-filter slot="tags"></app-tag-filter>
      </app-desktop-sidebar>
      <div class="space-y-8 p-4">
        <app-note-list></app-note-list>
      </div>
    </app-pagelayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListPageComponent {
  #deviceService = inject(DeviceDetectorService);
  readonly isMobile = computed(() => this.#deviceService.isMobile());
}
