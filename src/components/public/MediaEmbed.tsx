'use client';

import React from 'react';
import { FaYoutube, FaTiktok, FaExternalLinkAlt } from 'react-icons/fa';

type MediaEmbedProps = {
    id?: string;
    username?: string;
    thumbnailUrl?: string; // Optativo ahora
    title: string;
    isLive?: boolean;
    videoUrl: string;
};

function isImageUrl(url: string) {
    return /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);
}

const getEmbedData = (url: string | undefined, parentDomain: string) => {
    if (!url) return null;

    // YOUTUBE
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) return { type: 'youtube_link', url: url };

    // TWITCH (Canal o Video)
    const twitchChannelMatch = url.match(/(?:twitch\.tv\/)([^#\&\?]*)/);
    if (twitchChannelMatch) return { type: 'twitch', src: `https://player.twitch.tv/?channel=${twitchChannelMatch[1]}&parent=${parentDomain}&autoplay=false` };

    // TIKTOK (Solo URLs completas)
    const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/([\d]+)/);
    if (tiktokMatch) return { type: 'tiktok_link', url: url };

    // SPOTIFY
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist)\/([\w\d]+)/);
    if (spotifyMatch) return { type: 'spotify', src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}` };

    // APPLE MUSIC (Extra bonus)
    if (url.includes('music.apple.com')) {
        return { type: 'applemusic', src: url.replace('music.apple.com', 'embed.music.apple.com') };
    }

    return null; // No es un Smart Embed
};

export function isKnownEmbedUrl(url: string | undefined): boolean {
    // For module editor, we don't have window yet, but we just need to know if it matches
    return !!getEmbedData(url, 'localhost');
}

export default function MediaEmbed({ id, username, thumbnailUrl, title, isLive = false, videoUrl }: MediaEmbedProps) {
    const [hostname, setHostname] = React.useState('localhost');

    React.useEffect(() => {
        setHostname(window.location.hostname);
    }, []);

    const handleTrackClick = () => {
        if (!username || !id) return;
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, moduleId: id }),
            keepalive: true
        }).catch(err => console.error("Error tracking click", err));
    };

    const embed = getEmbedData(videoUrl, hostname);

    return (
        <div className="w-full relative group mt-2" onClick={handleTrackClick}>
            {embed ? (
                <div className="w-full shadow-xl rounded-[32px] overflow-hidden border border-gray-700/50 bg-black/10">
                    {embed.type === 'spotify' || embed.type === 'applemusic' ? (
                        <iframe
                            src={embed.src}
                            className="w-full border-0"
                            height={embed.type === 'spotify' ? '152' : '175'}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    ) : embed.type === 'youtube_link' ? (
                        <a href={embed.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <FaYoutube className="w-8 h-8 text-red-500" />
                                <span className="font-semibold text-white text-sm sm:text-base">Ver video en YouTube</span>
                            </div>
                            <FaExternalLinkAlt className="w-4 h-4 text-zinc-500" />
                        </a>
                    ) : embed.type === 'tiktok_link' ? (
                        <a href={embed.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <FaTiktok className="w-8 h-8 text-cyan-400" />
                                <span className="font-semibold text-white text-sm sm:text-base">Ver en TikTok</span>
                            </div>
                            <FaExternalLinkAlt className="w-4 h-4 text-zinc-500" />
                        </a>
                    ) : (
                        <div className="relative pt-[56.25%] bg-black">
                            <iframe
                                src={embed.src}
                                className="absolute inset-0 w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                            />
                        </div>
                    )}
                    {isLive && (
                        <div className={`absolute ${embed.type.includes('_link') ? 'top-1/2 -translate-y-1/2 right-12' : 'top-4 left-4'} z-20 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-red-400/50 shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-pulse pointer-events-none`}>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            En Vivo
                        </div>
                    )}
                </div>
            ) : isImageUrl(videoUrl) ? (
                <div className="relative w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden shadow-md mt-2">
                    <img
                        src={videoUrl}
                        alt={title || "Portada"}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            ) : (
                // Fallback para otros links
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden group shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    {thumbnailUrl ? (
                        <div className="relative w-full aspect-video overflow-hidden">
                            <img
                                src={thumbnailUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[#00FFCC] text-[10px] uppercase tracking-widest font-black">Abrir Enlace</span>
                                    <FaExternalLinkAlt className="w-3 h-3 text-[#00FFCC]" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-8 text-center flex flex-col items-center justify-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                <FaExternalLinkAlt className="text-xl text-white/70" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight mb-1">{title}</h3>
                                <p className="text-[#00FFCC] text-xs uppercase tracking-wider font-semibold">Visitar Sitio</p>
                            </div>
                        </div>
                    )}
                </a>
            )}
        </div>
    );
}
