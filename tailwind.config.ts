import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Mountains of Christmas"', 'cursive'],
        serif: ['Lora', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 1s',
        'snow': 'snow linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        snow: {
          '0%': { transform: 'translate(0, -100%)' },
          '100%': { transform: 'translate(25px, 100vh)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
