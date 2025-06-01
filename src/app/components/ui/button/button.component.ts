// File: src/app/button/button.component.ts
import { Component, signal, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

type Variant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  readonly link = input<string | undefined>(undefined);
  readonly variant = input<Variant>('default');
  readonly size = input<Size>('default');
  readonly className = input('');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly queryParams = input<
    Record<string, string | number | boolean> | undefined
  >(undefined);

  private base = signal(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  );
  private variants: Record<Variant, string> = {
    default:
      'bg-[var(--tw-primary)] text-white hover:bg-[var(--tw-primary)]/90',
    destructive:
      'bg-[var(--tw-destructive)] text-[var(--tw-destructive-foreground)] hover:bg-[var(--tw-destructive)]/90',
    outline:
      'border border-[var(--tw-input)] bg-[var(--tw-bg)] hover:bg-[var(--tw-accent)] hover:text-[var(--tw-accent-foreground)]',
    secondary:
      'bg-[var(--tw-secondary)] text-[var(--tw-secondary-foreground)] hover:bg-[var(--tw-secondary)]/80',
    ghost:
      'hover:bg-[var(--tw-accent)] hover:text-[var(--tw-accent-foreground)]',
    link: 'text-[var(--tw-primary)] underline-offset-4 hover:underline',
  };
  private sizes: Record<Size, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  readonly classes = computed(() => {
    const parts = [
      this.base(),
      this.variants[this.variant()],
      this.sizes[this.size()],
      this.className(),
    ].filter(Boolean);
    return parts.join(' ');
  });
}
