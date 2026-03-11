'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import toast from 'react-hot-toast';
import {
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    FacebookAuthProvider,
    GoogleAuthProvider,
    OAuthProvider
} from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export default function DeleteAccountZone() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleDeleteAccount = async () => {
        if (confirmText !== 'ELIMINAR') return;

        const user = auth.currentUser;
        if (!user) {
            setError('No hay usuario autenticado.');
            return;
        }

        const isOAuth = user.providerData.some(p => p.providerId !== 'password');

        if (!isOAuth && !currentPassword) {
            setError("Debes ingresar tu contraseña actual para confirmar.");
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            // Lógica de Re-autenticación (Requerida por Firebase para acciones sensibles)
            if (!isOAuth) {
                const credential = EmailAuthProvider.credential(user.email!, currentPassword);
                await reauthenticateWithCredential(user, credential);
            } else {
                // Encontrar proveedor OAuth principal
                const activeProvider = user.providerData.find(p => p.providerId !== 'password')?.providerId;
                let provider;

                switch (activeProvider) {
                    case 'google.com':
                        provider = new GoogleAuthProvider();
                        break;
                    case 'apple.com':
                        provider = new OAuthProvider('apple.com');
                        break;
                    case 'twitter.com':
                        provider = new OAuthProvider('twitter.com');
                        break;
                    case 'facebook.com':
                        provider = new FacebookAuthProvider();
                        break;
                    default:
                        throw new Error(`Proveedor no soportado para re-autenticación: ${activeProvider}`);
                }

                // Usamos reauthenticateWithPopup que es el método correcto para refrescar la sesión OAuth
                await reauthenticateWithPopup(user, provider);
            }

            // 1. Eliminar documentos del usuario y subcolecciones en Firestore
            const userRef = doc(db, 'creators', user.uid);
            const verificationRef = doc(db, 'verification_requests', user.uid);

            const cleanupSubcollection = async (collectionName: string) => {
                try {
                    const snap = await getDocs(collection(userRef, collectionName));
                    const promises = snap.docs.map(d => deleteDoc(d.ref));
                    await Promise.all(promises);
                    console.log(`[Cleanup] Deleted ${collectionName} for:`, user.uid);
                } catch (e) {
                    console.warn(`Error cleaning up ${collectionName}:`, e);
                }
            };

            try {
                // Borrado en paralelo de subcolecciones y documentos vinculados
                await Promise.all([
                    deleteDoc(verificationRef).catch(e => console.warn("Error deleting verification request:", e)),
                    cleanupSubcollection('notifications'),
                    cleanupSubcollection('modules'),
                    cleanupSubcollection('feed_posts'),
                    cleanupSubcollection('analytics_events'),
                    cleanupSubcollection('unlocked_modules')
                ]);

                // Eliminar documento principal del creador AL FINAL
                // Esto es lo que libera el nombre de usuario
                await deleteDoc(userRef);

                console.log("[Cleanup] Total Firestore data removed successfully for:", user.uid);
            } catch (firestoreError) {
                console.error('Critical error during Firestore cleanup:', firestoreError);
                // No detenemos el proceso, intentamos borrar Auth para no dejar sesión zombi
            }

            // 2. Eliminar usuario de Firebase Auth
            await deleteUser(user);

            // 3. Limpiar y redirigir
            toast.success("Tu cuenta ha sido eliminada permanentemente.");
            router.push('/');

        } catch (err: any) {
            const handledErrors = [
                'auth/requires-recent-login',
                'auth/wrong-password',
                'auth/invalid-credential',
                'auth/user-mismatch',
                'auth/popup-closed-by-user'
            ];

            if (!handledErrors.includes(err.code)) {
                console.error('Error al eliminar la cuenta:', err);
            }

            if (err.code === 'auth/requires-recent-login') {
                setError('Por seguridad, la sesión debe ser reciente. Por favor, cierra sesión y vuelve a entrar.');
            } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('La contraseña o las credenciales no son válidas. Intenta de nuevo.');
            } else if (err.code === 'auth/user-mismatch') {
                setError('La cuenta que seleccionaste no coincide con tu sesión actual.');
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError('Confirmación cancelada. Debes completar la autenticación.');
            } else {
                setError(err.message || 'Ha ocurrido un error al intentar eliminar la cuenta.');
            }
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-xl font-medium text-white mb-4">Zona de Peligro</h3>

            <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h4 className="text-white font-medium">Eliminar cuenta</h4>
                        <p className="text-sm text-gray-400 max-w-lg">
                            Una vez elimines tu cuenta, no hay vuelta atrás. Esto borrará permanentemente tu perfil público, enlaces y estadísticas de Nuxira.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-medium transition-colors"
                    >
                        Eliminar cuenta
                    </button>
                </div>
            </div>

            {/* Modal de Confirmación */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">

                        <h3 className="text-xl font-semibold text-white mb-2">
                            ¿Estás absolutamente seguro?
                        </h3>

                        <p className="text-gray-400 text-sm mb-6">
                            Esta acción <strong>no</strong> se puede deshacer. Esto eliminará permanentemente
                            tu cuenta y tus datos de nuestros servidores.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        {!auth.currentUser?.providerData?.some(p => p.providerId !== 'password') && (
                            <div className="space-y-3 mb-4">
                                <label htmlFor="current-password" className="block text-sm font-medium text-gray-300">
                                    Contraseña Actual
                                </label>
                                <input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={isDeleting}
                                    placeholder="Para confirmar tu identidad"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                                />
                            </div>
                        )}

                        <div className="space-y-3 mb-6">
                            <label htmlFor="confirm-delete" className="block text-sm font-medium text-gray-300">
                                Escribe <span className="text-white select-all font-mono font-bold">ELIMINAR</span> para confirmar
                            </label>
                            <input
                                id="confirm-delete"
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                autoComplete="off"
                                disabled={isDeleting}
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono uppercase"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setConfirmText('');
                                    setCurrentPassword('');
                                    setError(null);
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={confirmText !== 'ELIMINAR' || isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí, eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
