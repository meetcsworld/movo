/** @type {import('tailwindcss').Config} */
// QianyiClaw design tokens.
// The legacy MOVO UI was built around Tailwind's `blue` / `indigo` / `violet`
// palettes plus `slate` neutrals. We remap those palettes onto the QianyiClaw
// accent (elegant orange) and brand (cool neutral) scales here so every
// existing utility class inherits the new product identity without touching
// hundreds of templates.
const accent = {
    50: '#fff6ee',
    100: '#ffe9d5',
    200: '#ffd0a6',
    300: '#ffb574',
    400: '#f59a3c',
    500: '#e8811f',
    600: '#c96a12',
    700: '#a0520c',
    800: '#7a3e08',
    900: '#522805',
    950: '#3a1c04',
};

const brand = {
    50: '#f7f8fa',
    100: '#eff1f4',
    200: '#e6e9ee',
    300: '#d5dae2',
    400: '#98a0ae',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2329',
    900: '#14171c',
    950: '#0f1115',
};

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent,
                brand,
                blue: accent,
                indigo: accent,
                violet: accent,
                purple: accent,
                slate: brand,
                gray: brand,
            },
            borderRadius: {
                card: '12px',
                ctl: '8px',
                tag: '6px',
            },
            boxShadow: {
                card: '0 1px 2px rgba(20, 23, 28, 0.04)',
                pop: '0 8px 24px rgba(20, 23, 28, 0.10)',
            },
            fontFamily: {
                sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
