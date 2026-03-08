'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import toast from 'react-hot-toast';

interface StripeConnectZoneProps {
    creatorData: any;
    onUpdate: () => void;
}

type ConnectStatus = 'not_started' | 'incomplete' | 'complete';

export default function StripeConnectZone({ creatorData, onUpdate }: StripeConnectZoneProps) {
    const [loading, setLoading] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const isPremium = !!creatorData?.isPremium;

    // Derive the real 3-state status from Firestore data
    const connectStatus: ConnectStatus = (() => {
        if (!creatorData?.stripeAccountId) return 'not_started';
        if (creatorData?.stripeSetupComplete === true) return 'complete';
        return 'incomplete';
    })();

    // When the user returns from Stripe Onboarding, verify with backend
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const connectParam = params.get('connect');

        if ((connectParam === 'success' || connectParam === 'refresh') && auth.currentUser) {
            verifyStripeAccount(connectParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verifyStripeAccount = async (reason: string) => {
        if (!auth.currentUser) return;
        setIsVerifying(true);
        try {
            const res = await fetch('/api/stripe/verify-connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: auth.currentUser.uid }),
            });

            const data = await res.json();

            if (data.detailsSubmitted === true) {
                toast.success('¡Cuenta bancaria conectada exitosamente! Ya puedes recibir pagos. 🎉');
                onUpdate(); // Refresh Firestore data to show 'complete' state
            } else {
                toast.error(
                    'No completaste tus datos bancarios. Vuelve a intentarlo para poder recibir pagos.',
                    { duration: 6000 }
                );
                onUpdate(); // Still refresh to show 'incomplete' state properly
            }

            // Clean the query params from URL without reload
            const url = new URL(window.location.href);
            url.searchParams.delete('connect');
            window.history.replaceState({}, '', url.toString());

        } catch (err: any) {
            console.error('[verify-connect]', err);
            toast.error('Error verificando tu cuenta de Stripe.');
        } finally {
            setIsVerifying(false);
        }
    };

    // Handles both "Connect" (new) and "Resume" (incomplete)
    const handleConnect = async () => {
        if (!auth.currentUser) return;
        if (!isPremium) {
            toast.error('Debes ser Nuxira Pro para habilitar los Pagos Directos.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/stripe/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: auth.currentUser.uid }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.details || data.error || 'No URL');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error conectando con Stripe');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDashboard = async () => {
        if (!auth.currentUser || connectStatus !== 'complete') return;
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: creatorData.stripeAccountId }),
            });

            const data = await res.json();
            if (data.url) {
                window.open(data.url, '_blank');
            } else {
                throw new Error(data.details || data.error || 'No URL');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error accediendo al Dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!auth.currentUser || connectStatus === 'not_started') return;

        if (!window.confirm('¿Estás seguro de que deseas desconectar tu cuenta de Stripe? Ya no podrás recibir pagos directos.')) {
            return;
        }

        setIsDisconnecting(true);
        try {
            const res = await fetch('/api/stripe/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: auth.currentUser.uid }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Cuenta desconectada exitosamente');
                onUpdate();
            } else {
                throw new Error(data.details || data.error || 'Error desconocido');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al desconectar cuenta');
        } finally {
            setIsDisconnecting(false);
        }
    };

    const isBusy = loading || isDisconnecting || isVerifying;

    // ─── Status Badge ───────────────────────────────────────────────────────────
    const StatusBadge = () => {
        if (connectStatus === 'complete') {
            return (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse blur-[1px] shrink-0" />
                    Verificada en Stripe
                </span>
            );
        }
        if (connectStatus === 'incomplete') {
            return (
                <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                    Configuración incompleta
                </span>
            );
        }
        return (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0" />
                No conectada
            </span>
        );
    };

    // ─── Action Area ─────────────────────────────────────────────────────────────
    const ActionArea = () => {
        // Verifying spinner
        if (isVerifying) {
            return (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Verificando tu cuenta con Stripe...</p>
                </div>
            );
        }

        // State 1: Not started
        if (connectStatus === 'not_started') {
            return (
                <div className="text-center p-4">
                    <p className="text-gray-500 text-xs mb-4">Para poder cobrar a tus fans, necesitas verificar tu identidad y asociar una cuenta bancaria mediante la plataforma segura de Stripe.</p>
                    <button
                        onClick={handleConnect}
                        disabled={isBusy || !isPremium}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isBusy ? 'Redirigiendo...' : '🏦 Conectar Cuenta Bancaria'}
                        {!isPremium && <span className="ml-2 text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded uppercase tracking-wider">Pro</span>}
                    </button>
                </div>
            );
        }

        // State 2: Incomplete
        if (connectStatus === 'incomplete') {
            return (
                <div className="flex flex-col gap-3">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                        <div>
                            <p className="text-orange-300 font-bold text-sm mb-1">Configuración incompleta</p>
                            <p className="text-gray-400 text-xs leading-relaxed">No terminaste de ingresar tus datos bancarios en Stripe. Hasta que completes el proceso, no podrás recibir pagos de tus fans.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={isBusy}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isBusy ? 'Redirigiendo...' : '↩ Terminar de configurar cuenta'}
                    </button>
                </div>
            );
        }

        // State 3: Complete
        return (
            <div className="flex flex-col gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl shrink-0">✅</span>
                    <div>
                        <p className="text-green-400 font-bold text-sm">Cuenta conectada correctamente</p>
                        <p className="text-gray-400 text-xs mt-0.5">Estás listo para recibir el 85% de tus ventas directamente en tu banco.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleGoToDashboard}
                        disabled={isBusy}
                        className="flex-1 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Redirigiendo...' : 'Ver Ganancias en Stripe ↗'}
                    </button>
                    <button
                        onClick={handleConnect}
                        disabled={isBusy}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                    >
                        Ajustes bancarios
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            {/* Decorative Blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                    <span className="text-2xl drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">🏦</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Pagos y Comisiones</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Recibe el 85% de las ventas de tu Paywall directamente en tu cuenta bancaria a través de Stripe Connect.
                    </p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <span className="text-gray-400 font-medium text-sm">Estado de la cuenta</span>
                    <StatusBadge />
                </div>
                <ActionArea />
            </div>

            {/* Disconnect option – only visible if account exists (complete or incomplete) */}
            {connectStatus !== 'not_started' && (
                <div className="mt-4 flex flex-col items-center justify-center pt-2 border-t border-gray-800">
                    <button
                        onClick={handleDisconnect}
                        disabled={isBusy}
                        className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors underline-offset-4 hover:underline py-2"
                    >
                        {isDisconnecting ? 'Desconectando...' : 'Desconectar cuenta bancaria'}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center max-w-[250px] mt-1">
                        Si desconectas la cuenta bancaria, no podrás cobrar los ingresos de tus módulos premium.
                    </p>
                </div>
            )}

            <div className="flex items-center gap-2 text-[10px] text-gray-500 justify-center mt-3">
                <span>🔒 Pagos asegurados por</span>
                <span className="font-bold text-gray-400">Stripe Express</span>
            </div>
        </div>
    );
}
