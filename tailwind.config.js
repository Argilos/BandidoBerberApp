/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'matte-black': '#121212',
                'dark-grey': '#1E1E1E',
                'soft-white': '#F5F5F5',
                'gold': '#C6A355',
                'gold-light': '#D4AF37',
                'gold-dim': '#8A7130',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
