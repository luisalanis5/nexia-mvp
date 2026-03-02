import { Inter, Playfair_Display, Orbitron, Poppins } from 'next/font/google';

export const fontInter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export const fontPlayfair = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
});

export const fontOrbitron = Orbitron({
    subsets: ['latin'],
    display: 'swap',
});

export const fontPoppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    display: 'swap',
});

export const FONT_MAP: Record<string, string> = {
    'Inter': fontInter.className,
    'Playfair Display': fontPlayfair.className,
    'Orbitron': fontOrbitron.className,
    'Poppins': fontPoppins.className,
};

export const FONT_WHITELIST = Object.keys(FONT_MAP);
