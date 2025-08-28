import {
  Component,
  input,
  output,
  viewChild,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SearchInputComponent } from '../../../../components/ui/search-input/search-input.component';
import { IconChevronComponent } from '../../../../components/ui/icons/icon-chevron/icon-chevron.component';

@Component({
  selector: 'app-mobile-search-overlay',
  standalone: true,
  imports: [SearchInputComponent, IconChevronComponent],
  templateUrl: './mobile-search-overlay.component.html',
  styleUrl: './mobile-search-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSearchOverlayComponent {
  private platformId = inject(PLATFORM_ID);

  readonly isOpen = input.required<boolean>();
  readonly searchQuery = input.required<string>();
  readonly placeholder = input<string>('Search...');

  readonly searchQueryChange = output<string>();
  readonly closeOverlay = output<void>();

  readonly mobileSearchInputRef = viewChild<SearchInputComponent>('mobileSearchInput');
  readonly mobileSearchBarRef = viewChild<ElementRef<HTMLDivElement>>('mobileSearchBar');
  readonly overlayRef = viewChild<ElementRef<HTMLDivElement>>('overlay');

  onSearchOverlayClick(event: Event) {
    const target = event.target as HTMLElement;
    const searchBarElement = this.mobileSearchBarRef()?.nativeElement;

    // If click is not on the search bar (i.e., on backdrop), close the overlay
    if (searchBarElement && !searchBarElement.contains(target)) {
      this.closeOverlay.emit();
    }
  }

  onSearchOverlayKeydown(event: KeyboardEvent) {
    // Close overlay on Escape key
    if (event.key === 'Escape') {
      this.closeOverlay.emit();
    }
  }

  onSearchQueryChange(query: string) {
    this.searchQueryChange.emit(query);
  }

  onCloseClick() {
    this.closeOverlay.emit();
  }

  focusInput() {
    if (isPlatformBrowser(this.platformId)) {
      // First, programmatically show the overlay
      const overlayElement = this.overlayRef()?.nativeElement;
      if (overlayElement) {
        overlayElement.hidden = false;
      }
      
      // Then focus the input in the same execution context
      const searchInputComponent = this.mobileSearchInputRef();
      if (searchInputComponent) {
        searchInputComponent.focus();
      }
    }
  }

  hideOverlay() {
    if (isPlatformBrowser(this.platformId)) {
      const overlayElement = this.overlayRef()?.nativeElement;
      if (overlayElement) {
        overlayElement.hidden = true;
      }
    }
  }
}