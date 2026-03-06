import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Inicializa el perfil base de un creador en Firestore tras registrarse
 * Crea el documento principal en `users` y el perfil público en `profiles`.
 */
export async function createInitialProfile(uid: string, email: string, username: string, authProvider: string = 'password') {
    if (!uid || !email || !username) {
        throw new Error("Missing required fields for profile creation");
    }

    try {
        // 1. Data privada de la cuenta (Billing, Configuración, Meta)
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            uid,
            email,
            username: username.toLowerCase(),
            authProvider,
            plan: 'free',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        });

        // 2. Data pública visible en nuxira.app/username
        const profileRef = doc(db, 'profiles', uid);
        await setDoc(profileRef, {
            uid,
            username: username.toLowerCase(),
            displayName: username,
            bio: 'Bienvenido a mi Nuxira. Aquí encontrarás todos mis enlaces centralizados.',
            avatarUrl: '', // Default avatar handling usually done on the frontend
            theme: {
                primaryColor: '#c2cdff', // Nuxira Blue Neon requested
                mode: 'dark',
                buttonStyle: 'rounded',
                fontFamily: 'Inter',
            },
            isVerified: false,
            createdAt: serverTimestamp(),
        });

        console.log(`[Nuxira DB] Initialized documents for user: ${username}`);
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
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where("username", "==", username.toLowerCase()));
        const snapshot = await getDocs(q);

        // Si el snapshot está vacío, el username está disponible
        return snapshot.empty;
    } catch (error) {
        console.error("[Nuxira DB] Error checking username availability:", error);
        throw error;
    }
}
