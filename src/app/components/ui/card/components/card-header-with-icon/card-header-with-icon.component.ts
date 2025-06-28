import {
  Component,
  signal,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-card-header-with-icon',
  standalone: true,
  imports: [],
  template: `
    <div [class]="classes()">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          [style.background-color]="iconBgColor()"
        >
          <ng-content select="[icon]"></ng-content>
        </div>
        <h3 class="text-lg font-semibold text-[var(--tw-primary-dark)]">
          <ng-content></ng-content>
        </h3>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderWithIconComponent {
  className = input('');
  iconBgColor = input<string>('var(--tw-primary)');

  private base = signal('flex flex-col space-y-1.5');
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
