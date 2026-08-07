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
        ivory: colors.ivory,
        'warm-stone': colors['warm-stone'],
        silver: colors.silver,
        graphite: colors.graphite,
        charcoal: colors.charcoal,
        cobalt: colors.cobalt,
        coral: colors.coral,
      },
      fontFamily: {
        display: [...typography.fontFamily.display],
        sans: [...typography.fontFamily.sans],
        serif: [...typography.fontFamily.serif],
        mono: [...typography.fontFamily.mono],
      },
      spacing: spacing,
    },
  },
  plugins: [],
};

export default config;
