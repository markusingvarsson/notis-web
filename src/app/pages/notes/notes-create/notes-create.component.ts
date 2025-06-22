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

@Component({
  selector: 'app-notes-create',
  standalone: true,
  imports: [PagelayoutComponent, CreateNoteComponent],
  template: `
    <app-pagelayout
      [pageTitle]="'Create Note - Notis.nu'"
      [pageDescription]="'Create a new voice with tags and transcription.'"
      [pageKeywords]="
        'create note, new note, voice note, audio recording, notis'
      "
      [withFooter]="false"
    >
      <div
        class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"
      >
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Navigation Bar -->
          <nav class="flex items-center justify-between mb-8">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:ring-offset-0 transition-all duration-300"
              (click)="navigateBack()"
            >
              <svg
                class="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transform group-hover:-translate-x-0.5 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              <span>Back to Notes</span>
            </button>

            <!-- Breadcrumb -->
            <div
              class="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400"
            >
              <span>Notes</span>
              <svg
                class="w-4 h-4 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span class="text-slate-700 dark:text-slate-300 font-medium"
                >Create</span
              >
            </div>
          </nav>

          <!-- Main Content Area -->
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Create Note Section -->
            <div class="lg:col-span-2">
              <div
                class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20 overflow-hidden"
              >
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
              <!-- Quick Tips -->
              <div
                class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 backdrop-blur-sm border border-blue-200/60 dark:border-blue-800/60 rounded-2xl p-6 shadow-lg"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                  </div>
                  <h3
                    class="text-lg font-semibold text-blue-900 dark:text-blue-100"
                  >
                    Recording Tips
                  </h3>
                </div>
                <ul class="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                  <li class="flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
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
                      class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
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
                      class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
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

              <!-- Keyboard Shortcuts -->
              <div
                class="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-gray-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-lg"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center"
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <h3
                    class="text-lg font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Quick Actions
                  </h3>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-600 dark:text-slate-400"
                      >Start/Stop Recording</span
                    >
                    <kbd
                      class="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-mono"
                      >Space</kbd
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-600 dark:text-slate-400"
                      >Save Note</span
                    >
                    <kbd
                      class="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-mono"
                      >Ctrl+S</kbd
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-600 dark:text-slate-400"
                      >Go Back</span
                    >
                    <kbd
                      class="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-mono"
                      >Esc</kbd
                    >
                  </div>
                </div>
              </div>

              <!-- Statistics -->
              <div
                class="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 backdrop-blur-sm border border-green-200/60 dark:border-green-800/60 rounded-2xl p-6 shadow-lg"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"
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
                    class="text-lg font-semibold text-green-900 dark:text-green-100"
                  >
                    Your Progress
                  </h3>
                </div>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-green-800 dark:text-green-200"
                      >Total Notes</span
                    >
                    <span
                      class="text-lg font-bold text-green-900 dark:text-green-100"
                      >{{ getTotalNotes() }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-green-800 dark:text-green-200"
                      >Tags Created</span
                    >
                    <span
                      class="text-lg font-bold text-green-900 dark:text-green-100"
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
