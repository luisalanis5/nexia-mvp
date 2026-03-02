'use client';
import React, { useEffect, useState, useRef } from 'react';

type ProfileMediaEngineProps = {
    videoBgUrl?: string;
    audioBgUrl?: string;
};

/**
 * Extrae el videoId de cualquier variante de URL de YouTube:
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?si=XXXX
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&si=XXXX
 */
function extractYouTubeId(url: string): string | null {
    try {
        const u = new URL(url);
        const host = u.hostname.replace('www.', '');

        if (host === 'youtu.be') {
            // pathname = /Afe0VDjezXc  → tomar primer segmento
            const id = u.pathname.split('/').filter(Boolean)[0];
            return id || null;
        }
        if (host === 'youtube.com') {
            // ?v=VIDEO_ID
            return u.searchParams.get('v');
        }
    } catch { /* url inválida */ }
    return null;
}

function buildEmbedUrl(videoBgUrl: string): string | null {
    const ytId = extractYouTubeId(videoBgUrl);
    if (ytId) {
        return (
            `https://www.youtube-nocookie.com/embed/${ytId}` +
            `?autoplay=1&mute=1&loop=1&playlist=${ytId}` +
            `&controls=0&rel=0&modestbranding=1&playsinline=1`
        );
    }
    // Vimeo
    try {
        const u = new URL(videoBgUrl);
        if (u.hostname.includes('vimeo.com')) {
            const id = u.pathname.split('/').filter(Boolean).pop();
            if (id) return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1&dnt=1`;
        }
    } catch { /* */ }
    return null;
}

function isDirectMp4(url: string): boolean {
    try {
        return /\.(mp4|webm|ogg)(\?|$)/i.test(new URL(url).pathname);
    } catch { return false; }
}

export default function ProfileMediaEngine({ videoBgUrl, audioBgUrl }: ProfileMediaEngineProps) {
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => setVideoError(true));
        }
    }, [videoBgUrl]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(prev => {
            if (!prev) return true; // muting
            audioRef.current!.play().catch(() => { });
            return false;
        });
    };

    const embedUrl = videoBgUrl ? buildEmbedUrl(videoBgUrl) : null;
    const isMp4 = videoBgUrl ? isDirectMp4(videoBgUrl) : false;

    const BG_STYLE: React.CSSProperties = {
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: -10,
        pointerEvents: 'none',
        overflow: 'hidden',
    };

    return (
        <>
            {/* ── YouTube / Vimeo iframe ── */}
            {videoBgUrl && embedUrl && !videoError && (
                <div style={BG_STYLE}>
                    <iframe
                        src={embedUrl}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="bg-video"
                        style={{
                            position: 'absolute',
                            // Scale up to fill without black bars (16:9 → cover viewport)
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%) scale(1.5)',
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            opacity: 0.5,
                        }}
                    />
                </div>
            )}

            {/* ── MP4 / WebM directo ── */}
            {videoBgUrl && isMp4 && !videoError && (
                <div style={BG_STYLE}>
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onError={() => setVideoError(true)}
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            opacity: 0.5,
                        }}
                    >
                        <source src={videoBgUrl} type="video/mp4" />
                        <source src={videoBgUrl} type="video/webm" />
                    </video>
                </div>
            )}

            {/* ── Audio ambiental ── */}
            {audioBgUrl && (
                <>
                    <audio ref={audioRef} src={audioBgUrl} loop autoPlay muted preload="metadata" />
                    <button
                        onClick={toggleAudio}
                        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}
                        className="p-4 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-full
                                   shadow-[0_0_20px_rgba(0,0,0,0.5)] text-white hover:scale-110
                                   transition-transform flex items-center justify-center"
                        title={isMuted ? 'Activar audio ambiental' : 'Silenciar audio'}
                    >
                        <span className="text-xl leading-none">{isMuted ? '🔇' : '🔊'}</span>
                    </button>
                </>
            )}
        </>
    );
}
