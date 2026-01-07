/**
 * Scroll Reveal System
 * Manages IntersectionObserver for scroll-triggered animations
 * Supports staggered reveals and respects reduced motion preferences
 */

import { prefersReducedMotion } from './whimsy-utils';

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
}

const DEFAULT_OPTIONS: RevealOptions = {
  threshold: 0.05,
  rootMargin: '0px 0px 50px 0px',
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

          // Check if this is a reveal group (parent that triggers children)
          if (el.hasAttribute('data-reveal-group')) {
            revealGroupChildren(el);
            observer?.unobserve(el);
            return;
          }

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
 * Reveal all children within a reveal group
 */
function revealGroupChildren(parent: HTMLElement) {
  const children = parent.querySelectorAll(
    '.reveal-up, .reveal-scale, .reveal-blur, .reveal-fade, .reveal-bounce, [data-reveal]'
  );

  children.forEach((child) => {
    const el = child as HTMLElement;
    const delay = el.dataset.revealDelay;

    if (delay) {
      setTimeout(() => {
        el.classList.add('revealed');
      }, parseInt(delay, 10));
    } else {
      el.classList.add('revealed');
    }

    // Unobserve child since it's now handled by the group
    observer?.unobserve(el);
  });
}

/**
 * Observe all reveal elements in the DOM
 */
function observeElements() {
  if (!observer) return;

  // First, observe reveal groups (parent containers)
  const revealGroups = document.querySelectorAll('[data-reveal-group]');
  revealGroups.forEach((group) => {
    if (group.classList.contains('revealed')) return;
    observer?.observe(group);
  });

  // Then observe individual reveal elements that are NOT inside a reveal group
  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-scale, .reveal-blur, .reveal-fade, .reveal-bounce, [data-reveal]'
  );

  revealElements.forEach((el) => {
    // Skip already revealed elements
    if (el.classList.contains('revealed')) return;
    // Skip elements inside a reveal group (they'll be triggered by the parent)
    if (el.closest('[data-reveal-group]')) return;
    observer?.observe(el);
  });
}

/**
 * Immediately reveal all elements (for reduced motion)
 */
function revealAllImmediately() {
  // Reveal all reveal groups
  const revealGroups = document.querySelectorAll('[data-reveal-group]');
  revealGroups.forEach((el) => {
    el.classList.add('revealed');
  });

  // Reveal all individual elements
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
