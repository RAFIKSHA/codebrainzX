declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Module-level variable to keep track of the last tracked path.
// This prevents duplicate page_view events on initial load/remounts.
let lastTrackedPath = '';

/**
 * Tracks a page view event in Google Analytics 4.
 * @param path The URL path (e.g., '/dashboard').
 */
export const pageView = (path: string): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // Only track if the path is different from the last tracked one.
    if (lastTrackedPath !== path) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      });
      lastTrackedPath = path;
    }
  }
};

/**
 * Tracks a custom event in Google Analytics 4.
 * @param category The event category.
 * @param action The event action (used as the custom event name in GA4).
 * @param label An optional label for the event.
 * @param value An optional numeric value for the event.
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
