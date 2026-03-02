export type SkinName = 'default' | 'gotham' | 'burton' | 'minimalist' | 'neumorphism' | 'sunset';

export interface SkinConfig {
    id: SkinName;
    name: string;
    containerClass: string;
    cardClass: string;
    textClass: string;
    buttonClass: string;
    baseFont: string;
}

export const SKINS: Record<SkinName, SkinConfig> = {
    default: {
        id: 'default',
        name: 'Default (Glassmorphism)',
        containerClass: 'min-h-screen bg-[#0d0d12] text-white selection:bg-[#00FFCC] selection:text-black relative overflow-hidden',
        cardClass: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800',
        textClass: 'text-white',
        buttonClass: 'rounded-xl shadow-lg',
        baseFont: 'font-sans'
    },
    gotham: {
        id: 'gotham',
        name: 'Gotham (Oscuro)',
        containerClass: 'min-h-screen bg-zinc-950 text-gray-200 selection:bg-purple-600 selection:text-white relative overflow-hidden',
        cardClass: 'bg-zinc-900/80 border border-zinc-800 shadow-[0_0_15px_rgba(123,97,255,0.15)]',
        textClass: 'text-gray-100 font-black',
        buttonClass: 'rounded-sm border border-purple-500/50 shadow-[0_0_20px_rgba(123,97,255,0.4)]',
        baseFont: 'font-sans'
    },
    burton: {
        id: 'burton',
        name: 'Burton (Tim Burton Style)',
        containerClass: 'min-h-screen bg-stone-100 text-black selection:bg-stone-300 selection:text-black relative overflow-hidden',
        cardClass: 'bg-white border-2 border-stone-800 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]',
        textClass: 'text-stone-900',
        buttonClass: 'rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md border-2 border-stone-800 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]',
        baseFont: 'font-serif'
    },
    minimalist: {
        id: 'minimalist',
        name: 'Minimalist (Limpio)',
        containerClass: 'min-h-screen bg-white text-black selection:bg-black selection:text-white relative overflow-hidden',
        cardClass: 'bg-white border border-gray-200 shadow-sm',
        textClass: 'text-gray-900',
        buttonClass: 'rounded-full border border-gray-200 hover:bg-gray-50',
        baseFont: 'font-sans'
    },
    neumorphism: {
        id: 'neumorphism',
        name: 'Neumorphism (3D Suave)',
        containerClass: 'min-h-screen bg-[#E0E5EC] text-gray-700 selection:bg-purple-300 selection:text-black relative overflow-hidden',
        cardClass: 'bg-[#E0E5EC] rounded-2xl shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] border-none',
        textClass: 'text-gray-800',
        buttonClass: 'rounded-2xl shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] border-none',
        baseFont: 'font-sans'
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset (Gradiente Cálido)',
        containerClass: 'min-h-screen bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600 text-white selection:bg-white selection:text-orange-500 relative overflow-hidden',
        cardClass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
        textClass: 'text-white',
        buttonClass: 'rounded-xl bg-white/20 hover:bg-white/30 border border-white/30',
        baseFont: 'font-sans'
    }
};

export const getSkin = (skinId?: SkinName): SkinConfig => {
    return SKINS[skinId || 'default'] || SKINS['default'];
};
