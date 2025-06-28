import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { CreateNoteComponent } from '../../../domain/notes/components/create-note/create-note.component';
import { NotesStorageService } from '../../../domain/notes/services/notes-storage.service';
import { NoteCreated } from '../../../domain/notes';
import { IconChevronComponent } from '../../../components/ui/icons/icon-chevron/icon-chevron.component';

@Component({
  selector: 'app-notes-create',
  standalone: true,
  imports: [PagelayoutComponent, CreateNoteComponent, IconChevronComponent],
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
            <div
              class="hidden sm:flex items-center text-sm text-[var(--tw-text-muted)]"
            >
              <span>Notes</span>
              <app-icon-chevron
                [size]="16"
                [color]="'var(--tw-text-muted)'"
                [orientation]="'right'"
                class="mx-2"
              />
              <span class="text-[var(--tw-primary-dark)] font-medium"
                >Create</span
              >
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
            <div class="lg:col-span-1 space-y-6">
              <!-- Security Notice -->
              <div
                class="bg-[var(--tw-primary-accent-bg)] border border-[var(--tw-primary)]/20 rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-[var(--tw-primary)] rounded-xl flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                  </div>
                  <h3
                    class="text-lg font-semibold text-[var(--tw-primary-dark)]"
                  >
                    Secure & Private
                  </h3>
                </div>
                <ul class="space-y-3 text-sm text-[var(--tw-primary-dark)]">
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--tw-primary)] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>Your data stays on your device</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--tw-primary)] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>No tracking or analytics</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--tw-primary)] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>Encrypted local storage</span>
                  </li>
                </ul>
              </div>

              <!-- Recording Tips -->
              <div
                class="bg-[var(--tw-bg)] border border-[var(--tw-border-light)] rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-[var(--tw-highlight)] rounded-xl flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-[var(--tw-primary-dark)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                  </div>
                  <h3
                    class="text-lg font-semibold text-[var(--tw-primary-dark)]"
                  >
                    Recording Tips
                  </h3>
                </div>
                <ul class="space-y-3 text-sm text-[var(--tw-text-muted)]">
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--tw-primary)] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>Speak clearly and at a moderate pace</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--tw-primary)] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>Keep recordings under 5 minutes</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--tw-primary)] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span>Use descriptive tags for organization</span>
                  </li>
                </ul>
              </div>

              <!-- Your Progress -->
              <div
                class="bg-[var(--tw-bg)] border border-[var(--tw-border-light)] rounded-2xl p-6"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-[var(--tw-success)] rounded-xl flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
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

  onCreateNote(event: NoteCreated) {
    this.notesStorageService.addNote(event);
    this.navigateBack();
  }

  navigateBack() {
    this.router.navigate(['/notes/list']);
  }

  getTotalNotes(): number {
    return Object.keys(this.notesStorageService.getNotes()).length;
  }

  getTotalTags(): number {
    return Object.keys(this.availableTags()).length;
  }
}
