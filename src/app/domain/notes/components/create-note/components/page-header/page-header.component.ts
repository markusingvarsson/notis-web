import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  template: `
    <div
      class="bg-gradient-to-r from-[var(--tw-primary-light)] to-[var(--tw-primary)] p-6 text-center border-b border-[var(--tw-border-light)]"
    >
      <h2 class="text-2xl font-bold text-white mb-2">{{ title() }}</h2>
      @if (subtitle()) {
      <p class="text-sm text-white">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>();
}
