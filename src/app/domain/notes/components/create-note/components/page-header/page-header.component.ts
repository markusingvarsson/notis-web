import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { RECORDER_STATE, RecorderState } from '../../../../index';

@Component({
  selector: 'app-page-header',
  imports: [],
  template: `
    <div
      class="border-b border-[var(--tw-border-light)] px-8 py-6 transition-all duration-500"
      [class]="headerClasses()"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-300"
          [class]="iconContainerClasses()"
        >
          <ng-content select="[icon]"></ng-content>
        </div>
        <div>
          <h1
            class="text-2xl font-bold transition-all duration-300"
            [class]="titleClasses()"
          >
            {{ title() }}
          </h1>
          @if (subtitle()) {
          <p
            class="mt-1 transition-all duration-300"
            [class]="subtitleClasses()"
          >
            {{ subtitle() }}
          </p>
          }
        </div>
      </div>
      @if (isSaving()) {
      <div class="mt-4">
        <div
          class="h-1 bg-[var(--tw-border-light)] rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-gradient-to-r from-[var(--tw-primary)] to-[var(--tw-success)] rounded-full animate-pulse"
            style="width: 100%; animation: progress 2s ease-in-out infinite;"
          ></div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes progress {
        0%,
        100% {
          opacity: 0.6;
        }
        50% {
          opacity: 1;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>();
  recordingState = input<RecorderState>(RECORDER_STATE.IDLE);

  readonly isSaving = computed(
    () => this.recordingState() === RECORDER_STATE.SAVING
  );

  readonly headerClasses = computed(() => {
    if (this.isSaving()) {
      return 'bg-gradient-to-r from-[var(--tw-primary-accent-bg)] to-[var(--tw-success-accent-bg)]';
    }
    return 'bg-[var(--tw-primary-accent-bg)]';
  });

  readonly iconContainerClasses = computed(() => {
    if (this.isSaving()) {
      return 'bg-gradient-to-r from-[var(--tw-primary)] to-[var(--tw-success)] animate-pulse';
    }
    return 'bg-[var(--tw-primary)]';
  });

  readonly titleClasses = computed(() => {
    if (this.isSaving()) {
      return 'text-[var(--tw-success-dark)]';
    }
    return 'text-[var(--tw-primary-dark)]';
  });

  readonly subtitleClasses = computed(() => {
    if (this.isSaving()) {
      return 'text-[var(--tw-success-dark)]';
    }
    return 'text-[var(--tw-text-muted)]';
  });
}
