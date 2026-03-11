import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

export interface CreatorProfile {
    uid: string;
    email: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    authProvider: string;
    plan: string;
    isVerified: boolean;
    isPremium?: boolean;
    hasSeenWelcomeModal: boolean;
    modules: any[];
    theme: {
        primaryColor: string;
        mode: string;
        buttonStyle: string;
        fontFamily: string;
        activeSkin: string;
        fontMode?: string;
        videoBgUrl?: string;
        audioBgUrl?: string;
        backgroundImage?: string;
    };
    stripeAccountId?: string;
    stripeSetupComplete?: boolean;
    role?: string;
    createdAt: any;
    lastLogin: any;
}

/**
 * Función ultra-robusta y nítida para generar un Avatar (Versión SVG Initials)
 * Se usa SVG para Initials porque garantiza máxima nitidez en cualquier pantalla.
 */
export function getSmartAvatar(name: string, fallbackSeed: string): string {
    // Aseguramos que el seed no sea un objeto o undefined
    const safeName = typeof name === 'string' ? name : '';
    const safeFallback = typeof fallbackSeed === 'string' ? fallbackSeed : 'U';
    const seed = encodeURIComponent((safeName || safeFallback || 'N').trim());

    // Estilo 'initials' en SVG: Nítido, ligero y compatible.
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&chars=2`;
}

/**
 * Inicializa el perfil base de un creador en Firestore tras registrarse
 */
export async function createInitialProfile(uid: string, email: string, username: string, authProvider: string = 'password', displayNameFallback?: string) {
    if (!uid || !email || !username) {
        throw new Error("Missing required fields for profile creation");
    }

    try {
        const creatorRef = doc(db, 'creators', uid);
        const finalDisplayName = displayNameFallback || username;

        const newProfile: CreatorProfile = {
            uid,
            email,
            username: username.toLowerCase(),
            displayName: finalDisplayName,
            bio: 'Bienvenido a mi Nuxira. Aquí encontrarás todos mis enlaces centralizados.',
            avatarUrl: getSmartAvatar(finalDisplayName, username),
            authProvider,
            plan: 'free',
            isVerified: false,
            hasSeenWelcomeModal: false,
            modules: [],
            theme: {
                primaryColor: '#c2cdff',
                mode: 'dark',
                buttonStyle: 'rounded',
                fontFamily: 'Inter',
                activeSkin: 'default'
            },
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        };

        await setDoc(creatorRef, newProfile);

        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            await fetch(`${origin}/api/welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name: finalDisplayName })
            });
        } catch (apiErr) {
            console.error("Error trigger welcome API:", apiErr);
        }

        console.log(`[Nuxira DB] Initialized documents for creator: ${username}`);
        return true;
    } catch (error) {
        console.error("[Nuxira DB] Error creating initial profile:", error);
        throw error;
    }
}

/**
 * Verifica si un username ya está en uso en Firestore
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
    if (!username) return false;

    try {
        const profilesRef = collection(db, 'creators');
        const q = query(profilesRef, where("username", "==", username.toLowerCase()));
        const snapshot = await getDocs(q);
        return snapshot.empty;
    } catch (error) {
        console.error("[Nuxira DB] Error checking username availability:", error);
        throw error;
    }
}
