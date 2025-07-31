export const PAGINATION_CONSTANTS = {
  /** Number of notes to load per virtual page */
  PAGE_SIZE: 20,
  
  /** Scroll threshold for loading more content on mobile (px) */
  MOBILE_SCROLL_THRESHOLD: 400,
  
  /** Scroll threshold for loading more content on desktop (px) */
  DESKTOP_SCROLL_THRESHOLD: 200,
  
  /** Loading delay for mobile (ms) */
  MOBILE_LOADING_DELAY: 150,
  
  /** Loading delay for desktop (ms) */
  DESKTOP_LOADING_DELAY: 300,
  
  /** Mobile breakpoint (px) */
  MOBILE_BREAKPOINT: 768,
} as const;