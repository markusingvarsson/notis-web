import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { IconFilterComponent } from '../../../../components/ui/icons/icon-filter/icon-filter.component';
import { IconXComponent } from '../../../../components/ui/icons/icon-x/icon-x.component';

@Component({
  selector: 'app-notes-filter',
  standalone: true,
  imports: [ButtonComponent, IconFilterComponent, IconXComponent],
  templateUrl: './notes-filter.component.html',
  styleUrls: ['./notes-filter.component.scss'],
})
export class NotesFilterComponent implements AfterViewInit {
  /** Inputs as signals */
  readonly availableTags = input.required<string[]>();
  readonly selectedTags = input.required<string[]>();

  /** Outputs */
  readonly tagToggle = output<string>();
  readonly clearFilters = output<void>();

  /** Helpers */
  readonly hasTags = computed(() => this.availableTags().length > 0);
  getButtonVariant(tag: string | null) {
    if (tag === null) {
      return this.selectedTags().length === 0 ? 'default' : 'outline';
    }
    return this.selectedTags().includes(tag) ? 'default' : 'outline';
  }

  /** Scroll state */
  private readonly tagContainer =
    viewChild<ElementRef<HTMLDivElement>>('tagContainer');
  readonly showLeftFade = signal(false);
  readonly showRightFade = signal(false);

  ngAfterViewInit(): void {
    // Use a timeout to ensure the view is fully initialized before checking scroll state.
    setTimeout(() => this.checkScroll(), 0);
  }

  onScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    const el = this.tagContainer()?.nativeElement;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    this.showLeftFade.set(scrollLeft > 5);
    // Check if scrolled to the end (with a small tolerance)
    this.showRightFade.set(scrollWidth - scrollLeft - clientWidth > 5);
  }

  onTagToggle(tag: string): void {
    this.tagToggle.emit(tag);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }
}
