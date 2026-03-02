'use client';

import React from 'react';

type NativeAdProps = {
    id?: string;
    username?: string;
    image: string;
    title: string;
    description: string;
    ctaText: string;
    url: string;
    brandLogo?: string;
    brandName?: string;
    isGlobalAd?: boolean;
};

export default function NativeAd({
    id,
    username,
    image,
    title,
    description,
    ctaText,
    url,
    brandLogo = "https://api.dicebear.com/7.x/identicon/svg?seed=brand1",
    brandName = "Sponsor",
    isGlobalAd = false
}: NativeAdProps) {

    const handleTrackClick = () => {
        if (!id) return;
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, moduleId: id, isGlobalAd }),
            keepalive: true
        }).catch(err => console.error("Error tracking click", err));
    };

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTrackClick}
            className="block w-full bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-[32px] overflow-hidden hover:border-gray-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative"
        >
            {/* Etiqueta de Patrocinado Oculta pero Semántica / Micro-tag */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-300 uppercase tracking-widest z-20 border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Ad
            </div>

            {/* Imagen Principal (Aspect Ratio Portada) */}
            <div className="h-48 sm:h-56 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Micro-avatar de la marca (Estilo IG/TikTok) */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden bg-black/50 backdrop-blur-md">
                        <img src={brandLogo} alt={brandName} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">{brandName}</span>
                </div>
            </div>

            {/* Contenido y CTA */}
            <div className="p-5 relative z-20 -mt-8 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-6">
                <h4 className="text-white font-black text-xl leading-tight mb-1 group-hover:text-[#00FFCC] transition-colors">{title}</h4>
                <p className="text-gray-400 text-sm leading-snug mb-5">{description}</p>

                {/* Botón CTA de Alta Conversión con efecto Shimmer */}
                <div className="relative w-full overflow-hidden rounded-2xl p-[1px]">
                    <span className="absolute inset-0 bg-gradient-to-r from-[#00FFCC] via-white to-[#00FFCC] opacity-70 group-hover:opacity-100 group-hover:animate-[spin_2s_linear_infinite]" />
                    <div className="relative bg-black w-full text-center py-3.5 rounded-2xl flex items-center justify-center gap-2 group-hover:bg-[#00FFCC]/10 transition-colors">
                        <span className="text-[#00FFCC] font-bold tracking-wide text-sm uppercase">{ctaText}</span>
                        <svg className="w-4 h-4 text-[#00FFCC] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    );
}
