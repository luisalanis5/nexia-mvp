'use client';

import React from 'react';
import { FaInstagram, FaGithub, FaApple, FaGooglePlay, FaLink, FaTiktok, FaYoutube, FaFacebook, FaSpotify, FaTwitter, FaTwitch } from 'react-icons/fa';

type LinksListProps = {
    modules: any[];
    theme: {
        primaryColor: string;
        mode?: string;
        fontMode?: string;
        buttonStyle?: string;
        activeSkin?: string;
        fontFamily?: string;
        videoBgUrl?: string;
        audioBgUrl?: string;
    };
    username?: string;
};

const getIconForUrl = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram.com')) return <FaInstagram className="w-6 h-6 text-pink-500" />;
    if (lowerUrl.includes('github.com')) return <FaGithub className="w-6 h-6 text-white" />;
    if (lowerUrl.includes('apple.com') || lowerUrl.includes('apps.apple')) return <FaApple className="w-6 h-6 text-gray-200" />;
    if (lowerUrl.includes('play.google.com')) return <FaGooglePlay className="w-6 h-6 text-green-400" />;
    if (lowerUrl.includes('tiktok.com')) return <FaTiktok className="w-6 h-6 text-white" />;
    if (lowerUrl.includes('youtube.com')) return <FaYoutube className="w-6 h-6 text-red-500" />;
    if (lowerUrl.includes('facebook.com')) return <FaFacebook className="w-6 h-6 text-blue-600" />;
    if (lowerUrl.includes('spotify.com')) return <FaSpotify className="w-6 h-6 text-green-500" />;
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <FaTwitter className="w-6 h-6 text-blue-400" />;
    if (lowerUrl.includes('twitch.tv')) return <FaTwitch className="w-6 h-6 text-purple-600" />;
    return <FaLink className="w-6 h-6 text-gray-400" />;
};

export default function LinksList({ modules, theme, username }: LinksListProps) {
    const linksModules = modules.filter((m: any) => m.type === 'links' && m.items && m.items.length > 0);

    const handleTrackClick = (moduleId: string) => {
        if (!username || !moduleId) return;

        // No esperamos (fire and forget) para no bloquear la redirección
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, moduleId }),
            keepalive: true // Asegura que se envíe incluso si la página descarga
        }).catch(err => console.error("Error tracking click", err));
    };

    if (linksModules.length === 0) {
        return (
            <div className="text-center p-6 border border-dashed border-gray-700 rounded-xl text-gray-500 w-full">
                Aún no hay enlaces publicados.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {linksModules.map((mod: any) => {
                const linkData = mod.items[0];
                if (!linkData) return null;

                return (
                    <a
                        key={mod.id}
                        href={linkData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(mod.id)}
                        className="group relative w-full p-4 rounded-2xl bg-gray-800/60 backdrop-blur-md border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                            style={{ backgroundColor: theme.primaryColor }}
                        />

                        <div className="relative z-10 flex items-center justify-center w-full gap-3">
                            {getIconForUrl(linkData.url)}
                            <span className="font-semibold text-white/90 group-hover:text-white transition-colors text-lg">
                                {linkData.name}
                            </span>
                        </div>
                    </a>
                );
            })}
        </div>
    );
}
