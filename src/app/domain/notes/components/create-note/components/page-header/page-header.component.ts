import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  template: `
    <div
      class="bg-[var(--tw-primary-accent-bg)] border-b border-[var(--tw-border-light)] px-8 py-6"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 bg-[var(--tw-primary)] rounded-xl flex items-center justify-center shadow-md"
        >
          <ng-content select="[icon]"></ng-content>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-[var(--tw-primary-dark)]">
            {{ title() }}
          </h1>
          @if (subtitle()) {
          <p class="text-[var(--tw-text-muted)] mt-1">
            {{ subtitle() }}
          </p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>();
}
