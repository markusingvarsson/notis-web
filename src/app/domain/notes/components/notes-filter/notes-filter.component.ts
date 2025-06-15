import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../../components/ui/button/button.component';

@Component({
  selector: 'app-notes-filter',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './notes-filter.component.html',
  styleUrls: ['./notes-filter.component.scss'],
})
export class NotesFilterComponent implements AfterViewInit {
  /** Inputs as signals */
  readonly availableTags = input.required<string[]>();
  readonly selectedTag = input.required<string | null>();

  /** Outputs */
  readonly tagToggle = output<string>();
  readonly clearFilters = output<void>();

  /** Helpers */
  getButtonVariant(tag: string | null) {
    return this.selectedTag() === tag ? 'default' : 'outline';
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
