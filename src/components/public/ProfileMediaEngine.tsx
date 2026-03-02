'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';

type ProfileMediaEngineProps = {
    videoBgUrl?: string; // Now used for image background
    audioBgUrl?: string;
};

export default function ProfileMediaEngine({ videoBgUrl, audioBgUrl }: ProfileMediaEngineProps) {
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(prev => {
            if (!prev) return true; // muting
            audioRef.current!.play().catch(() => { });
            return false;
        });
    };

    return (
        <>
            {/* ── Fondo Dinámico Animado o Imagen Estática ── */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
                {videoBgUrl && (
                    <>
                        <Image
                            src={videoBgUrl}
                            alt="Background"
                            fill
                            className="object-cover opacity-60 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
                    </>
                )}
            </div>

            {/* ── Audio ambiental ── */}
            {audioBgUrl && (
                <>
                    <audio ref={audioRef} src={audioBgUrl} loop autoPlay muted preload="metadata" />
                    <button
                        onClick={toggleAudio}
                        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}
                        className="p-4 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] text-white hover:scale-110 transition-transform flex items-center justify-center"
                        title={isMuted ? 'Activar audio ambiental' : 'Silenciar audio'}
                    >
                        <span className="text-xl leading-none">{isMuted ? '🔇' : '🔊'}</span>
                    </button>
                </>
            )}
        </>
    );
}
