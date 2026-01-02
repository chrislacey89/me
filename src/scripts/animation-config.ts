/**
 * Animation Configuration
 * Centralized constants for all interactive animations
 */

// Lerp interpolation factors (0-1, higher = faster)
export const LERP = {
  fast: 0.2,
  medium: 0.15,
  slow: 0.12,
} as const;

// Tilt effect maximums (degrees)
export const TILT = {
  projectCard: 4,
  skillIcon: 3,
  contactCard: 0, // No tilt on contact cards
} as const;

// Shadow shift maximums (pixels)
export const SHADOW = {
  maxShift: 8,
  baseOffset: 4,
} as const;

// Bounce/magnetic movement (pixels)
export const MOVEMENT = {
  skillBounce: -4,
  magneticStrength: 8,
} as const;

// Glow effect sizes (pixels)
export const GLOW = {
  contactCard: 200,
} as const;

// Animation thresholds for settling detection
export const THRESHOLD = {
  rotation: 0.01,
  position: 0.1,
} as const;

// Colors (for reference - also defined in Tailwind)
export const COLORS = {
  teal: {
    400: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.4)',
  },
  sky: {
    400: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
  },
  purple: {
    400: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.4)',
  },
} as const;
