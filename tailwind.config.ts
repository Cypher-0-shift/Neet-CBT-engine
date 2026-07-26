import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NTA CBT Question Palette Colors
        palette: {
          'not-visited': '#C0C0C0',     // Grey
          'not-answered': '#E74C3C',    // Red
          answered: '#27AE60',          // Green
          'marked-review': '#8E44AD',   // Purple
          'answered-marked': '#8E44AD', // Purple (with tick overlay)
        },
        // Exam UI Colors
        exam: {
          'header-bg': '#1B3A5C',       // Deep navy header
          'header-text': '#FFFFFF',
          'sidebar-bg': '#F0F0F0',
          'body-bg': '#FFFFFF',
          'footer-bg': '#E8E8E8',
          'border': '#CCCCCC',
          'tab-active': '#1B3A5C',
          'tab-inactive': '#6C757D',
          'timer-normal': '#FFFFFF',
          'timer-warning': '#FF6B35',
          'timer-critical': '#E74C3C',
        },
        // Application Theme Colors
        app: {
          'primary': '#1B3A5C',
          'primary-hover': '#2C5282',
          'secondary': '#4A90D9',
          'accent': '#27AE60',
          'danger': '#E74C3C',
          'warning': '#F39C12',
          'info': '#3498DB',
          'surface': '#FFFFFF',
          'surface-alt': '#F8F9FA',
          'background': '#ECEFF1',
          'text-primary': '#212529',
          'text-secondary': '#6C757D',
          'text-muted': '#ADB5BD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'exam-question': ['1.0625rem', { lineHeight: '1.625' }],
        'exam-option': ['0.9375rem', { lineHeight: '1.5' }],
        'exam-header': ['0.8125rem', { lineHeight: '1.25' }],
        'timer': ['1.25rem', { lineHeight: '1' }],
      },
      spacing: {
        'exam-padding': '1rem',
        'palette-gap': '0.375rem',
      },
      boxShadow: {
        'exam': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'exam-hover': '0 2px 6px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
