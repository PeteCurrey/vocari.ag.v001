/**
 * Design Tokens for Vocari
 * Single source of truth for colors, typography, spacing, and surface registers.
 * Aligned with Avorria corporate design standard — precision, authority, clarity.
 */

export const colors = {
  ivory:        '#F7F5F2',
  'warm-stone': '#E9E6E1',
  silver:       '#C7CCD1',
  graphite:     '#2B2D31',
  charcoal:     '#121417',
  cobalt:       '#0057FF',
  coral:        '#FF6B57',
} as const;

export type ColorKey = keyof typeof colors;

export const typography = {
  fontFamily: {
    display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
    sans:    ['var(--font-space-grotesk)', 'Helvetica Neue', 'sans-serif'],
    serif:   ['var(--font-dm-serif)', 'Georgia', 'serif'],
    mono:    ['var(--font-jetbrains-mono)', 'Courier New', 'monospace'],
  },
  registers: {
    consumer: {
      baseFontSize: '16px',
      lineHeight:   '1.6',
      headingWeight: '500',
    },
    partner: {
      baseFontSize: '15px',
      lineHeight:   '1.5',
      headingWeight: '500',
    },
  },
} as const;

export const spacing = {
  xs:   '0.25rem',
  sm:   '0.5rem',
  md:   '1rem',
  lg:   '1.5rem',
  xl:   '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const easing = {
  default: 'cubic-bezier(0.16, 1, 0.3, 1)',
  smooth:  'cubic-bezier(0.25, 1, 0.5, 1)',
  sharp:   'cubic-bezier(0.7, 0, 0.84, 0)',
} as const;

export const surfaceRegisters = {
  consumer: {
    bg:             colors.ivory,
    bgSubtle:       colors['warm-stone'],
    cardBg:         '#FFFFFF',
    text:           colors.charcoal,
    textMuted:      colors.graphite,
    border:         colors.silver,
    primaryAction:  colors.cobalt,
    accentProgress: colors.coral,
    fontScaleClass: 'text-base leading-relaxed',
  },
  partner: {
    bg:          colors.charcoal,
    bgSubtle:    colors.graphite,
    cardBg:      '#1B1D21',
    text:        colors.ivory,
    textMuted:   colors.silver,
    border:      colors.graphite,
    primaryAction: colors.cobalt,
    accentAlert: colors.coral,
    fontScaleClass: 'text-sm leading-normal',
  },
} as const;

export type SurfaceType = 'consumer' | 'partner';
