'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function AccountSettings() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [providerId, setProviderId] = useState<string | null>(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setEmail(user.email || '');
            // Detect primary provider
            if (user.providerData && user.providerData.length > 0) {
                setProviderId(user.providerData[0].providerId);
            }
        }
    }, [auth.currentUser]);

    const isOAuth = providerId && providerId !== 'password';

    const getProviderName = (id: string) => {
        switch (id) {
            case 'google.com': return 'Google';
            case 'apple.com': return 'Apple';
            case 'twitter.com': return 'X (Twitter)';
            case 'facebook.com': return 'Facebook';
            default: return 'Otro proveedor';
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || isOAuth) return;

        if (!currentPassword) {
            toast.error("Debes ingresar tu contraseña actual para guardar los cambios.");
            return;
        }

        setIsSaving(true);
        try {
            // Reauthenticating first
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);

            let updated = false;

            if (email !== user.email) {
                await updateEmail(user, email);
                updated = true;
            }

            if (newPassword) {
                await updatePassword(user, newPassword);
                updated = true;
            }

            if (updated) {
                toast.success("Cuenta actualizada exitosamente.");
                setNewPassword('');
                setCurrentPassword('');
            } else {
                toast.error("No hay cambios detectados.");
            }
        } catch (error: any) {
            console.error("Error updating account:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error("La contraseña actual es incorrecta.");
            } else {
                toast.error("Error al actualizar la cuenta. " + error.message);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">Ajustes de Seguridad</h3>

            {isOAuth ? (
                <div className="p-4 rounded-xl border border-[#c2cdff]/20 bg-[#c2cdff]/5 flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                        <p className="text-white font-medium">Cuenta vinculada mediante {getProviderName(providerId)}</p>
                        <p className="text-sm text-[#c2cdff]">
                            Gestiona tu correo y contraseña directamente en {getProviderName(providerId)}.
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-400">Actualiza tus credenciales de acceso. Te pediremos tu contraseña actual por seguridad.</p>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isOAuth || isSaving}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c2cdff] focus:ring-1 focus:ring-[#c2cdff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {!isOAuth && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nueva Contraseña (Opcional)</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isSaving}
                                placeholder="Déjalo en blanco para mantener la actual"
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c2cdff] focus:ring-1 focus:ring-[#c2cdff] transition-all"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="block text-sm font-medium text-[#c2cdff] mb-2">Contraseña Actual *</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                disabled={isSaving}
                                required
                                placeholder="Para autorizar cambios"
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving || !currentPassword}
                                className="px-6 py-3 bg-gradient-to-r from-[#c2cdff] to-[#00FFCC] text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Guardando...' : 'Actualizar Credenciales'}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}
