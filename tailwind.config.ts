import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#121212',
        navy: {
          950: '#050A14',
          900: '#080D1A',
          800: '#0F1E3C',
          700: '#162B54',
          600: '#1A2F5A',
          500: '#1E3A6E',
        },
        crimson: {
          900: '#5A0A0A',
          800: '#7B1111',
          700: '#8B1515',
          600: '#991818',
          500: '#B52020',
          400: '#CC2929',
        },
        gold: {
          900: '#3D2B00',
          800: '#6B4A00',
          700: '#96690A',
          600: '#B87D0A',
          500: '#D4A017',
          400: '#E8B520',
          300: '#F0C93A',
          200: '#F5D978',
          100: '#FBF0C4',
        },
        parchment: {
          50:  '#FAFAF5',
          100: '#F5F0E8',
          200: '#E8E0D0',
          300: '#D4C8B8',
          400: '#B8A898',
          500: '#9C8878',
          600: '#7A6A5C',
        },
        // kept for any residual references
        stone: {
          50:  '#F4F1EA',
          100: '#E8E4DB',
          200: '#C6B8A3',
          300: '#A49582',
          400: '#7D7267',
          500: '#4A4A4A',
          600: '#3A3A3A',
          700: '#2A2A2A',
          800: '#1E1E1E',
          900: '#0F0F0F',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans:  ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
