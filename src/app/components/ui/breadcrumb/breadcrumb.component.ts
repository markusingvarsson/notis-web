import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconChevronComponent } from '../icons/icon-chevron/icon-chevron.component';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  queryParams?: Record<string, string | number | boolean>;
  isActive?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [IconChevronComponent],
  template: `
    <nav class="flex items-center text-sm" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2">
        @for (item of items(); track item.label; let last = $last) {
        <li class="flex items-center">
          @if (last) {
          <!-- Last item (current page) -->
          <span
            class="text-[var(--tw-primary-dark)] font-medium"
            [class.cursor-pointer]="item.route"
            [class.cursor-default]="!item.route"
            [class.hover:text-[var(--tw-primary)]]="item.route"
            [class.hover:underline]="item.route"
            [tabindex]="item.route ? 0 : -1"
            (click)="item.route ? navigateTo(item) : null"
            (keydown.enter)="item.route ? navigateTo(item) : null"
            (keydown.space)="item.route ? navigateTo(item) : null"
            role="button"
            [attr.aria-label]="
              item.route ? 'Navigate to ' + item.label : item.label
            "
          >
            {{ item.label }}
          </span>
          } @else {
          <!-- Clickable breadcrumb item -->
          <button
            type="button"
            class="text-[var(--tw-text-muted)] hover:text-[var(--tw-primary)] hover:underline transition-all duration-200 cursor-pointer"
            (click)="navigateTo(item)"
            [disabled]="!item.route"
            [class.cursor-not-allowed]="!item.route"
            [class.opacity-50]="!item.route"
            [attr.aria-label]="'Navigate to ' + item.label"
          >
            {{ item.label }}
          </button>

          <!-- Chevron separator -->
          <app-icon-chevron
            [size]="16"
            [color]="'var(--tw-text-muted)'"
            [orientation]="'right'"
            class="mx-2"
          />
          }
        </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  private router = inject(Router);

  readonly items = input.required<BreadcrumbItem[]>();

  navigateTo(item: BreadcrumbItem): void {
    if (item.route) {
      if (item.queryParams) {
        this.router.navigate([item.route], { queryParams: item.queryParams });
      } else {
        this.router.navigate([item.route]);
      }
    }
  }
}
