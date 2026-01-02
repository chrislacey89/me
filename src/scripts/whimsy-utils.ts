/**
 * Whimsy Utilities
 * Shared animation utilities for spring physics, interpolation, and motion preferences
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface SpringState {
  position: number;
  velocity: number;
}

// Preset spring configurations
export const SPRING_PRESETS = {
  // Snappy but soft - good for magnetic buttons
  snappy: { stiffness: 150, damping: 15, mass: 1 },
  // Gentle - good for subtle movements
  gentle: { stiffness: 100, damping: 20, mass: 1 },
  // Bouncy - good for playful effects
  bouncy: { stiffness: 200, damping: 10, mass: 1 },
  // Stiff - good for quick snaps
  stiff: { stiffness: 300, damping: 25, mass: 1 },
} as const;

/**
 * Calculate spring physics update
 * Returns new position and velocity based on spring dynamics
 */
export function spring(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig,
  deltaTime: number
): SpringState {
  const { stiffness, damping, mass } = config;

  // Spring force: F = -k * x (Hooke's law)
  const displacement = current - target;
  const springForce = -stiffness * displacement;

  // Damping force: F = -c * v
  const dampingForce = -damping * velocity;

  // Acceleration: a = F / m
  const acceleration = (springForce + dampingForce) / mass;

  // Update velocity and position using semi-implicit Euler
  const newVelocity = velocity + acceleration * deltaTime;
  const newPosition = current + newVelocity * deltaTime;

  return {
    position: newPosition,
    velocity: newVelocity,
  };
}

/**
 * Check if spring has settled (close enough to target with low velocity)
 */
export function isSpringSettled(
  current: number,
  target: number,
  velocity: number,
  threshold: number = 0.01
): boolean {
  return Math.abs(current - target) < threshold && Math.abs(velocity) < threshold;
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalize a value from one range to another
 */
export function normalize(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number = 0,
  outMax: number = 1
): number {
  const normalized = (value - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get element center coordinates
 */
export function getElementCenter(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Calculate distance from cursor to element center
 */
export function getDistanceToElement(
  mouseX: number,
  mouseY: number,
  element: HTMLElement
): number {
  const center = getElementCenter(element);
  return distance(mouseX, mouseY, center.x, center.y);
}

/**
 * Calculate cursor position relative to element center (normalized -1 to 1)
 */
export function getCursorRelativePosition(
  mouseX: number,
  mouseY: number,
  element: HTMLElement
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return {
    x: (mouseX - centerX) / (rect.width / 2),
    y: (mouseY - centerY) / (rect.height / 2),
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subscribe to reduced motion preference changes
 */
export function onReducedMotionChange(callback: (prefersReduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Check if device supports hover (not touch-only)
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Throttle function execution using requestAnimationFrame
 */
export function rafThrottle<T extends (...args: unknown[]) => void>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
}

/**
 * Generate a random number in a range
 */
export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Pick a random item from an array
 */
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Ease out cubic - decelerating to zero velocity
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease out elastic - overshoots then settles
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Interactive component initialization helper
 * Provides proper cleanup on view transitions
 */
export interface InteractiveComponentOptions {
  onInit: (abortSignal: AbortSignal) => void;
  onCleanup?: () => void;
}

const cleanupRegistry = new Map<string, () => void>();

export function initInteractiveComponent(
  id: string,
  options: InteractiveComponentOptions
): void {
  // Clean up previous instance if exists
  const existingCleanup = cleanupRegistry.get(id);
  if (existingCleanup) {
    existingCleanup();
  }

  const controller = new AbortController();

  // Run initialization
  options.onInit(controller.signal);

  // Store cleanup function
  const cleanup = () => {
    controller.abort();
    options.onCleanup?.();
    cleanupRegistry.delete(id);
  };

  cleanupRegistry.set(id, cleanup);

  // Auto-cleanup on view transitions
  document.addEventListener(
    'astro:before-swap',
    () => {
      cleanup();
    },
    { once: true, signal: controller.signal }
  );
}

/**
 * Shared RAF loop for multiple animations
 * Reduces overhead of multiple independent loops
 */
type AnimationCallback = (deltaTime: number) => boolean; // Return false to unsubscribe

class SharedAnimationLoop {
  private callbacks = new Set<AnimationCallback>();
  private rafId: number | null = null;
  private lastTime = 0;

  subscribe(callback: AnimationCallback): () => void {
    this.callbacks.add(callback);
    this.start();
    return () => this.unsubscribe(callback);
  }

  private unsubscribe(callback: AnimationCallback): void {
    this.callbacks.delete(callback);
    if (this.callbacks.size === 0) {
      this.stop();
    }
  }

  private start(): void {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.tick();
  }

  private stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;

    // Run callbacks and remove those that return false
    for (const callback of this.callbacks) {
      const shouldContinue = callback(deltaTime);
      if (!shouldContinue) {
        this.callbacks.delete(callback);
      }
    }

    if (this.callbacks.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.rafId = null;
    }
  };
}

export const sharedAnimationLoop = new SharedAnimationLoop();
