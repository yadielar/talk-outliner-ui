import twTypography from '@tailwindcss/typography';
import twAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // shadcn-ui colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // voice colors
        quote: 'hsl(var(--quote))',
        neutral: {
          DEFAULT: 'hsl(var(--neutral))',
          active: 'hsl(var(--neutral-active))',
          foreground: 'hsl(var(--neutral-foreground))',
        },
        question: {
          DEFAULT: 'hsl(var(--question))',
          active: 'hsl(var(--question-active))',
          foreground: 'hsl(var(--question-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          active: 'hsl(var(--info-active))',
          foreground: 'hsl(var(--info-foreground))',
        },
        reference: {
          DEFAULT: 'hsl(var(--reference))',
          active: 'hsl(var(--reference-active))',
          foreground: 'hsl(var(--reference-foreground))',
        },
        example: {
          DEFAULT: 'hsl(var(--example))',
          active: 'hsl(var(--example-active))',
          foreground: 'hsl(var(--example-foreground))',
        },
        story: {
          DEFAULT: 'hsl(var(--story))',
          active: 'hsl(var(--story-active))',
          foreground: 'hsl(var(--story-foreground))',
        },
        lesson: {
          DEFAULT: 'hsl(var(--lesson))',
          active: 'hsl(var(--lesson-active))',
          foreground: 'hsl(var(--lesson-foreground))',
        },
        action: {
          DEFAULT: 'hsl(var(--action))',
          active: 'hsl(var(--action-active))',
          foreground: 'hsl(var(--action-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: {
        slate: {
          css: {
            '--tw-prose-body': 'inherit',
            '--tw-prose-bold': 'inherit',
          },
        },
      },
    },
  },
  plugins: [twTypography, twAnimate],
};
