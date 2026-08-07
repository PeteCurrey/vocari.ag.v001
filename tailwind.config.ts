import type { Config } from 'tailwindcss';
import { colors, typography, spacing } from './lib/design/tokens';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory:        colors.ivory,
        'warm-stone': colors['warm-stone'],
        silver:       colors.silver,
        graphite:     colors.graphite,
        charcoal:     colors.charcoal,
        cobalt:       colors.cobalt,
        coral:        colors.coral,
      },
      fontFamily: {
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans:    ['var(--font-space-grotesk)', 'Helvetica Neue', 'sans-serif'],
        serif:   ['var(--font-dm-serif)', 'Georgia', 'serif'],
        mono:    ['var(--font-jetbrains-mono)', 'Courier New', 'monospace'],
      },
      spacing,
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.4rem' }],
        base:  ['1rem',     { lineHeight: '1.6rem' }],
        lg:    ['1.125rem', { lineHeight: '1.7rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.6rem' }],
        '2xl': ['1.5rem',   { lineHeight: '1.2rem' }],
        '3xl': ['2rem',     { lineHeight: '1.1rem' }],
        '4xl': ['2.5rem',   { lineHeight: '1.05rem' }],
        '5xl': ['3.5rem',   { lineHeight: '1rem' }],
        '6xl': ['4.5rem',   { lineHeight: '0.97rem' }],
        '7xl': ['6rem',     { lineHeight: '0.95rem' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.02em',
        tight:    '-0.01em',
        normal:   '0',
        wide:     '0.04em',
        wider:    '0.08em',
        widest:   '0.18em',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
};

export default config;
