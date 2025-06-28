import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [IconChevronComponent, RouterLink],
  template: `
    <nav class="flex items-center text-sm" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2">
        @for (item of items(); track item.label; let last = $last) {
        <li class="flex items-center">
          @if (last) {
          <!-- Last item (current page) -->
          @if (item.route) {
          <a
            [routerLink]="[item.route]"
            [queryParams]="item.queryParams"
            class="text-[var(--tw-primary-dark)] font-medium hover:text-[var(--tw-primary)] hover:underline transition-all duration-200"
            [attr.aria-label]="'Navigate to ' + item.label"
          >
            {{ item.label }}
          </a>
          } @else {
          <span
            class="text-[var(--tw-primary-dark)] font-medium"
            [attr.aria-current]="'page'"
          >
            {{ item.label }}
          </span>
          } } @else {
          <!-- Clickable breadcrumb item -->
          @if (item.route) {
          <a
            [routerLink]="[item.route]"
            [queryParams]="item.queryParams"
            class="text-[var(--tw-text-muted)] hover:text-[var(--tw-primary)] hover:underline transition-all duration-200"
            [attr.aria-label]="'Navigate to ' + item.label"
          >
            {{ item.label }}
          </a>
          } @else {
          <span
            class="text-[var(--tw-text-muted)] opacity-50 cursor-not-allowed"
          >
            {{ item.label }}
          </span>
          }

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
  readonly items = input.required<BreadcrumbItem[]>();
}
