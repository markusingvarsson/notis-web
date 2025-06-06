import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  template: `
    <div
      class="bg-gradient-to-r from-[var(--tw-primary-light)] to-[var(--tw-primary)] text-center border-b border-[var(--tw-border-light)]"
      [class.p-6]="subtitle()"
      [class.p-3]="!subtitle()"
    >
      <h2
        class="font-bold text-white"
        [class.text-2xl]="subtitle()"
        [class.text-xl]="!subtitle()"
      >
        {{ title() }}
      </h2>
      @if (subtitle()) {
      <p class="text-sm text-white mt-2">{{ subtitle() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>();
}
