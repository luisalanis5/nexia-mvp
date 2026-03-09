import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, clearIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializa Firebase solo si no se ha hecho ya (vital para Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

// Configuración de Firestore con Persistencia Robusta
let db: ReturnType<typeof getFirestore>;

if (typeof window !== 'undefined') {
    // En el cliente, intentamos inicializar con persistencia multi-pestaña
    try {
        // initializeFirestore solo debe llamarse una vez por App. 
        // Si ya existe una instancia activa, getFirestore(app) la devolverá.
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });
    } catch (e: any) {
        // Si ya está inicializado (común en HMR), usamos la instancia existente
        db = getFirestore(app);

        // Manejo de errores específicos de sincronización
        if (e.code === 'failed-precondition' || (e.message && e.message.includes('future'))) {
            console.warn("[Firestore] Limpiando persistencia por conflicto de estado/tiempo...");
            clearIndexedDbPersistence(db).catch(() => { });
        }
    }
} else {
    // En el servidor (SSR/Edge), Firestore estándar sin caché local
    db = getFirestore(app);
}

export { db };
