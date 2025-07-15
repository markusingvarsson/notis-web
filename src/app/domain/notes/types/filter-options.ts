export interface FilterOptions {
  tags: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  contentLength: [number, number];
  sortBy: 'newest' | 'oldest' | 'title' | 'relevance';
}

export interface FilterPanelProps {
  availableTags: string[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  noteCount: number;
}