/**
 * Scroll Reveal System
 * Manages IntersectionObserver for scroll-triggered animations
 * Supports staggered reveals and respects reduced motion preferences
 */

import { prefersReducedMotion } from './whimsy-utils';

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
}

const DEFAULT_OPTIONS: RevealOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
  staggerDelay: 50,
};

let observer: IntersectionObserver | null = null;
let isInitialized = false;

/**
 * Initialize the scroll reveal system
 */
export function initScrollReveal(options: RevealOptions = {}) {
  // Skip if already initialized or reduced motion preferred
  if (isInitialized && observer) {
    // Re-observe any new elements
    observeElements();
    return;
  }

  if (prefersReducedMotion()) {
    // If reduced motion is preferred, immediately reveal all elements
    revealAllImmediately();
    return;
  }

  const { threshold, rootMargin } = { ...DEFAULT_OPTIONS, ...options };

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;

          // Apply reveal with any stagger delay
          const delay = el.dataset.revealDelay;
          if (delay) {
            setTimeout(() => {
              el.classList.add('revealed');
            }, parseInt(delay, 10));
          } else {
            el.classList.add('revealed');
          }

          // Unobserve after revealing
          observer?.unobserve(el);
        }
      });
    },
    { threshold, rootMargin }
  );

  observeElements();
  isInitialized = true;
}

/**
 * Observe all reveal elements in the DOM
 */
function observeElements() {
  if (!observer) return;

  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-scale, .reveal-blur, .reveal-fade, .reveal-bounce, [data-reveal]'
  );

  revealElements.forEach((el) => {
    // Skip already revealed elements
    if (el.classList.contains('revealed')) return;
    observer?.observe(el);
  });
}

/**
 * Apply staggered delays to a group of elements
 */
export function applyStaggeredDelays(
  selector: string,
  baseDelay: number = 0,
  staggerDelay: number = 50
) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, index) => {
    (el as HTMLElement).dataset.revealDelay = String(baseDelay + index * staggerDelay);
  });
}

/**
 * Immediately reveal all elements (for reduced motion)
 */
function revealAllImmediately() {
  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-scale, .reveal-blur, .reveal-fade, .reveal-bounce, [data-reveal]'
  );

  revealElements.forEach((el) => {
    el.classList.add('revealed');
  });
}

/**
 * Clean up observer
 */
export function destroyScrollReveal() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  isInitialized = false;
}

/**
 * Reset for view transitions - re-observe elements
 */
export function resetScrollReveal() {
  if (prefersReducedMotion()) {
    revealAllImmediately();
    return;
  }

  // Re-observe any new elements after view transition
  observeElements();
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Initialize on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initScrollReveal());
  } else {
    initScrollReveal();
  }

  // Handle Astro view transitions
  document.addEventListener('astro:after-swap', () => {
    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      resetScrollReveal();
    });
  });

  // Listen for reduced motion changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
      revealAllImmediately();
    }
  });
}
