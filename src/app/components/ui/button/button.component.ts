import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  imports: [RouterLink],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  link = input.required<string>();
  buttonName = input.required<string>();
  className = input<string>('');
  variant = input<'cta' | 'ghost'>();
  buttonClasses = computed(() => {
    const base = 'py-2 px-4 rounded-md font-bold';
    const ctaClasses = 'bg-[var(--tw-primary)] text-white hover:brightness-110';
    const defaultClasses =
      'bg-[var(--tw-bg-light)] text-[var(--tw-primary-dark)] hover:bg-[var(--tw-bg)]';
    let result = `${base} ${this.className}`;
    if (this.variant() === 'cta') {
      result += ` ${ctaClasses}`;
    } else {
      result += ` ${defaultClasses}`;
    }
    return result;
  });
}
