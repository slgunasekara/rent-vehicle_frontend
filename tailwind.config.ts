import type {Config} from 'tailwindcss';

export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                navy: {950: '#03152e', 900: '#041f41', 800: '#062c5c', 700: '#073b78', 600: '#0c4f9e'},
                brand: {
                    50: '#eef5ff',
                    100: '#dbe9fb',
                    200: '#bcd5f5',
                    400: '#4f93e6',
                    500: '#2f7fd6',
                    600: '#1e63b8',
                    700: '#164a8c'
                },
                aqua: {300: '#8fe3f2', 400: '#5fd0e8', 500: '#22b8d8'},
                surface: '#eef2f8',
            },
            fontFamily: {sans: ['Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'Segoe UI', 'system-ui', 'sans-serif']},
            boxShadow: {
                soft: '0 10px 30px -12px rgba(6,44,92,.25)',
                glow: '0 0 0 4px rgba(47,127,214,.18)',
            },
            keyframes: {
                floaty: {'0%,100%': {transform: 'translateY(0)'}, '50%': {transform: 'translateY(-10px)'}},
                softin: {from: {opacity: '0', transform: 'translateY(8px)'}, to: {opacity: '1', transform: 'none'}},
                rise: {from: {opacity: '0', transform: 'translateY(18px)'}, to: {opacity: '1', transform: 'none'}},
                pulsedot: {
                    '0%': {boxShadow: '0 0 0 0 rgba(16,185,129,.55)'},
                    '100%': {boxShadow: '0 0 0 9px rgba(16,185,129,0)'}
                },
                drawline: {from: {transform: 'scaleX(0)'}, to: {transform: 'scaleX(1)'}},
            },
            animation: {
                floaty: 'floaty 5s ease-in-out infinite',
                rise: 'rise .7s ease both',
                softin: 'softin 2s cubic-bezier(.4,0,.2,1) both',
                pulsedot: 'pulsedot 1.6s ease-out infinite'
            },
        },
    },
    plugins: [],
} satisfies Config;
