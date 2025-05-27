/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',    // Indigo principale
        secondary: '#10B981',  // Verde
        accent: '#F59E0B',     // Arancione
        success: '#22C55E',    // Verde successo
        warning: '#F97316',    // Arancione avviso
        error: '#EF4444',      // Rosso errore
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        eventhub: {
          "primary": "#4F46E5",
          "primary-focus": "#3730A3",
          "primary-content": "#ffffff",
          "secondary": "#10B981",
          "secondary-focus": "#059669",
          "secondary-content": "#ffffff",
          "accent": "#F59E0B",
          "accent-focus": "#D97706",
          "accent-content": "#ffffff",
          "neutral": "#374151",
          "neutral-focus": "#1F2937",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F9FAFB",
          "base-300": "#F3F4F6",
          "base-content": "#1F2937",
          "info": "#3B82F6",
          "success": "#22C55E",
          "warning": "#F97316",
          "error": "#EF4444"
        },
      },
    ],
  },
}