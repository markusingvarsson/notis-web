import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { CreateNoteComponent } from '../../../domain/notes/components/create-note/create-note.component';
import { NotesStorageService } from '../../../domain/notes/services/notes-storage.service';
import { NoteCreated } from '../../../domain/notes';
import { IconChevronComponent } from '../../../components/ui/icons/icon-chevron/icon-chevron.component';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/ui/breadcrumb/breadcrumb.component';
import { CheckboxIconComponent } from '../../../components/ui/icons/checkbox-icon/checkbox-icon.component';
import { BarChartIconComponent } from '../../../components/ui/icons/bar-chart-icon/bar-chart-icon.component';
import { LightbulbIconComponent } from '../../../components/ui/icons/lightbulb-icon/lightbulb-icon.component';
import { ShieldCheckIconComponent } from '../../../components/ui/icons/shield-check-icon/shield-check-icon.component';
import { CardComponent } from '../../../components/ui/card/card.component';
import { CardHeaderWithIconComponent } from '../../../components/ui/card/components/card-header-with-icon/card-header-with-icon.component';

@Component({
  selector: 'app-notes-create',
  standalone: true,
  imports: [
    PagelayoutComponent,
    CreateNoteComponent,
    IconChevronComponent,
    BreadcrumbComponent,
    CheckboxIconComponent,
    BarChartIconComponent,
    LightbulbIconComponent,
    ShieldCheckIconComponent,
    CardComponent,
    CardHeaderWithIconComponent,
  ],
  template: `
    <app-pagelayout
      [pageTitle]="'Create Note - Notis.nu'"
      [pageDescription]="'Create a new voice with tags and transcription.'"
      [pageKeywords]="
        'create note, new note, voice note, audio recording, notis'
      "
      [withFooter]="false"
    >
      <div class="min-h-screen bg-[var(--tw-bg-light)]">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Navigation Bar -->
          <nav class="flex items-center justify-between mb-6 sm:mb-8">
            <button
              type="button"
              class="group flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:inline-flex sm:gap-3 sm:px-4 sm:py-3 text-sm font-medium text-[var(--tw-text)] bg-white border border-gray-200 rounded-full sm:rounded-xl hover:bg-gray-50 hover:shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all duration-200 active:scale-95"
              (click)="navigateBack()"
            >
              <app-icon-chevron
                [size]="18"
                [color]="'currentColor'"
                [orientation]="'left'"
                class="transform group-hover:-translate-x-0.5 transition-transform duration-200"
              />
              <span class="hidden sm:inline">Back</span>
            </button>

            <!-- Desktop: Breadcrumb -->
            <div class="hidden sm:block">
              <app-breadcrumb [items]="breadcrumbItems()" />
            </div>
          </nav>

          <!-- Main Content Area -->
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Create Note Section -->
            <div class="lg:col-span-2">
              <app-create-note
                [CTA]="CTA()"
                (noteCreated)="onCreateNote($event)"
                [availableTags]="availableTags()"
              ></app-create-note>
            </div>

            <!-- Sidebar -->
            <div class="hidden lg:block lg:col-span-1 space-y-6">
              <!-- Your Progress -->
              <app-card
                className="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <app-card-header-with-icon [iconBgColor]="'var(--tw-success)'">
                  <app-bar-chart-icon icon [size]="20" [color]="'white'" />
                  Your Progress
                </app-card-header-with-icon>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-[var(--tw-text-muted)]"
                      >Total Notes</span
                    >
                    <span
                      class="text-lg font-bold text-[var(--tw-primary-dark)]"
                      >{{ getTotalNotes() }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-[var(--tw-text-muted)]"
                      >Tags Created</span
                    >
                    <span
                      class="text-lg font-bold text-[var(--tw-primary-dark)]"
                      >{{ getTotalTags() }}</span
                    >
                  </div>
                </div>
              </app-card>

              <!-- Recording Tips -->
              <app-card
                className="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <app-card-header-with-icon
                  [iconBgColor]="'var(--tw-highlight)'"
                >
                  <app-lightbulb-icon
                    icon
                    [size]="20"
                    [color]="'var(--tw-primary-dark)'"
                  />
                  Recording Tips
                </app-card-header-with-icon>
                <ul class="space-y-3 text-sm text-[var(--tw-text-muted)]">
                  <li class="flex items-start gap-2">
                    <app-checkbox-icon
                      [size]="16"
                      [color]="'var(--tw-primary)'"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <span>Speak clearly and at a moderate pace</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <app-checkbox-icon
                      [size]="16"
                      [color]="'var(--tw-primary)'"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <span>Keep recordings under 5 minutes</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <app-checkbox-icon
                      [size]="16"
                      [color]="'var(--tw-primary)'"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <span>Use descriptive tags for organization</span>
                  </li>
                </ul>
              </app-card>

              <!-- Security Notice -->
              <app-card
                className="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <app-card-header-with-icon [iconBgColor]="'var(--tw-primary)'">
                  <app-shield-check-icon icon [size]="20" [color]="'white'" />
                  Secure & Private
                </app-card-header-with-icon>
                <ul class="space-y-3 text-sm text-[var(--tw-primary-dark)]">
                  <li class="flex items-start gap-2">
                    <app-checkbox-icon
                      [size]="16"
                      [color]="'var(--tw-primary)'"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <span>Your data stays on your device</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <app-checkbox-icon
                      [size]="16"
                      [color]="'var(--tw-primary)'"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <span>No tracking or analytics</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <app-checkbox-icon
                      [size]="16"
                      [color]="'var(--tw-primary)'"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <span>Encrypted local storage</span>
                  </li>
                </ul>
              </app-card>
            </div>
          </div>
        </div>
      </div>
    </app-pagelayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesCreateComponent {
  private router = inject(Router);
  private notesStorageService = inject(NotesStorageService);

  readonly CTA = input<boolean>(false);
  readonly availableTags = this.notesStorageService.getTags();
  readonly notes = this.notesStorageService.getNotes();

  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Notes', route: '/notes' },
    { label: 'Create' },
  ]);

  onCreateNote(event: NoteCreated) {
    this.notesStorageService.addNote(event);
    this.navigateBack();
  }

  navigateBack() {
    this.router.navigate(['/notes']);
  }

  getTotalNotes(): number {
    return this.notes().length;
  }

  getTotalTags(): number {
    return Object.keys(this.availableTags()).length;
  }
}
