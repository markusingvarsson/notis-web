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
          <nav class="flex items-center justify-between mb-8">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--tw-primary-dark)] bg-[var(--tw-bg-light)] border border-[var(--tw-border-light)] rounded-xl hover:bg-[var(--tw-bg)] hover:shadow-md hover:border-[var(--tw-border)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-primary)]/20 focus:ring-offset-0 transition-all duration-300"
              (click)="navigateBack()"
            >
              <app-icon-chevron
                [size]="20"
                [color]="'var(--tw-border-dark)'"
                [orientation]="'left'"
                class="group-hover:text-[var(--tw-primary)] transform group-hover:-translate-x-0.5 transition-all duration-200"
              />
              <span>Back to Notes</span>
            </button>

            <!-- Breadcrumb -->
            <div class="hidden sm:block">
              <app-breadcrumb [items]="breadcrumbItems()" />
            </div>
          </nav>

          <!-- Main Content Area -->
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Create Note Section -->
            <div class="lg:col-span-2">
              <div
                class="bg-[var(--tw-bg-light)] border border-[var(--tw-border-light)] rounded-2xl shadow-lg overflow-hidden"
              >
                <div
                  class="bg-[var(--tw-primary-accent-bg)] border-b border-[var(--tw-border-light)] px-8 py-6"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-[var(--tw-primary)] rounded-xl flex items-center justify-center shadow-md"
                    >
                      <svg
                        class="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h1
                        class="text-2xl font-bold text-[var(--tw-primary-dark)]"
                      >
                        Create Your Note
                      </h1>
                      <p class="text-[var(--tw-text-muted)] mt-1">
                        Record your thoughts securely and privately
                      </p>
                    </div>
                  </div>
                </div>
                <div class="p-8">
                  <app-create-note
                    [CTA]="CTA()"
                    (noteCreated)="onCreateNote($event)"
                    [availableTags]="availableTags()"
                  ></app-create-note>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="hidden lg:block lg:col-span-1 space-y-6">
              <!-- Your Progress -->
              <div
                class="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-[var(--tw-success)] rounded-xl flex items-center justify-center"
                  >
                    <app-bar-chart-icon
                      [size]="20"
                      [color]="'white'"
                    />
                  </div>
                  <h3
                    class="text-lg font-semibold text-[var(--tw-primary-dark)]"
                  >
                    Your Progress
                  </h3>
                </div>
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
              </div>

              <!-- Recording Tips -->
              <div
                class="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-[var(--tw-highlight)] rounded-xl flex items-center justify-center"
                  >
                    <app-lightbulb-icon
                      [size]="20"
                      [color]="'var(--tw-primary-dark)'"
                    />
                  </div>
                  <h3
                    class="text-lg font-semibold text-[var(--tw-primary-dark)]"
                  >
                    Recording Tips
                  </h3>
                </div>
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
              </div>

              <!-- Security Notice -->
              <div
                class="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-[var(--tw-primary)] rounded-xl flex items-center justify-center"
                  >
                    <app-shield-check-icon
                      [size]="20"
                      [color]="'white'"
                    />
                  </div>
                  <h3
                    class="text-lg font-semibold text-[var(--tw-primary-dark)]"
                  >
                    Secure & Private
                  </h3>
                </div>
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
              </div>
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
    return Object.keys(this.notesStorageService.getNotes()).length;
  }

  getTotalTags(): number {
    return Object.keys(this.availableTags()).length;
  }
}
