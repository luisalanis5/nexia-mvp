'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

interface PublicProfileCTAProps {
    appName: string;
    textColor: string;
    primaryColor: string;
}

export default function PublicProfileCTA({ appName, textColor, primaryColor }: PublicProfileCTAProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });
        return () => unsubscribe();
    }, []);

    // Avoid hydration mismatch by not rendering until auth is checked, 
    // or render a neutral fallback.
    if (isAuthenticated === null) {
        return (
            <div className="mt-16 mb-8 text-center text-sm font-medium flex flex-col items-center gap-2" style={{ color: textColor }}>
                <div className="w-10 h-1 rounded-full mb-2 opacity-50" style={{ backgroundColor: textColor }}></div>
                <span className="opacity-70 transition-opacity">
                    Potenciado por <span className="font-bold tracking-widest uppercase" style={{ color: primaryColor }}>{appName}</span>
                </span>
            </div>
        );
    }

    return (
        <div className="mt-16 mb-8 text-center text-sm font-medium flex flex-col items-center gap-4" style={{ color: textColor }}>
            <div className="w-10 h-1 rounded-full mb-2 opacity-50" style={{ backgroundColor: textColor }}></div>
            <Link
                href={isAuthenticated ? "/dashboard" : "/dashboard/register"}
                className="px-6 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{
                    backgroundColor: primaryColor,
                    color: '#050505',
                    boxShadow: `0 0 15px ${primaryColor}40`
                }}
            >
                {isAuthenticated ? "Ir a tu Centro de Mando" : `Crea tu propio perfil en ${appName}`}
            </Link>

            <Link href="/" className="hover:opacity-70 transition-opacity mt-2 text-xs opacity-60">
                Potenciado por <span className="font-bold tracking-widest uppercase" style={{ color: primaryColor }}>{appName}</span>
            </Link>
        </div>
    );
}
