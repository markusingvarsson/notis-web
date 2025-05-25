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
  isCta = input.required<boolean>();
  buttonClasses = computed(() => {
    const base =
      'py-2 px-4 rounded-md font-bold transition-colors duration-200';
    const ctaClasses = 'bg-[var(--tw-primary)] text-white hover:brightness-110';
    const defaultClasses =
      'bg-[var(--tw-bg-light)] text-[var(--tw-primary-dark)] hover:bg-[var(--tw-bg)]';
    return `${base} ${this.isCta() ? ctaClasses : defaultClasses}`;
  });
}
