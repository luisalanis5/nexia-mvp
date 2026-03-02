import { Inter, Playfair_Display, Roboto_Mono, Montserrat } from 'next/font/google';

export const fontInter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export const fontPlayfair = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
});

export const fontRobotoMono = Roboto_Mono({
    subsets: ['latin'],
    display: 'swap',
});

export const fontMontserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
});

export const FONT_MAP: Record<string, string> = {
    'Inter': fontInter.className,
    'Playfair Display': fontPlayfair.className,
    'Roboto Mono': fontRobotoMono.className,
    'Montserrat': fontMontserrat.className,
};

export const FONT_WHITELIST = Object.keys(FONT_MAP);
