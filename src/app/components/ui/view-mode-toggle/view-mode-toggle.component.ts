import { Component, model } from '@angular/core';

export type ViewMode = 'grid' | 'single';

@Component({
  selector: 'app-view-mode-toggle',
  standalone: true,
  template: `
    <div class="hidden md:flex bg-gray-100 rounded-lg p-1">
      <button
        (click)="viewMode.set('grid')"
        class="p-2 rounded-md transition-all duration-200"
        [class.bg-white]="viewMode() === 'grid'"
        [class.text-[var(--tw-primary)]]="viewMode() === 'grid'"
        [class.shadow-sm]="viewMode() === 'grid'"
        [class.text-gray-600]="viewMode() !== 'grid'"
        [class.hover:text-[var(--tw-primary)]]="viewMode() !== 'grid'"
        aria-label="Grid view"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          ></path>
        </svg>
      </button>
      <button
        (click)="viewMode.set('single')"
        class="p-2 rounded-md transition-all duration-200"
        [class.bg-white]="viewMode() === 'single'"
        [class.text-[var(--tw-primary)]]="viewMode() === 'single'"
        [class.shadow-sm]="viewMode() === 'single'"
        [class.text-gray-600]="viewMode() !== 'single'"
        [class.hover:text-[var(--tw-primary)]]="viewMode() !== 'single'"
        aria-label="Single column view"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          ></path>
        </svg>
      </button>
    </div>
  `,
})
export class ViewModeToggleComponent {
  readonly viewMode = model.required<ViewMode>();
}