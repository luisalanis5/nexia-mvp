'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import toast from 'react-hot-toast';
import { APP_NAME } from '@/config/brand';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Todo esto te llevará al Onboarding si tienes éxito en crear la cuenta en AUTH.
    // Será en /onboarding donde se creará tu perfil en la DB
    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/onboarding');
        } catch (error) {
            console.error("❌ Error en autenticación:", error);
            toast.error("Hubo un problema al registrarte con Google.");
        }
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.success("Cuenta creada exitosamente. ¡Configuremos tu enlace!");
            router.push('/onboarding');
        } catch (error: any) {
            console.error("❌ Error register email:", error);
            toast.error(error.message || "No se pudo crear la cuenta.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        console.log("Pendiente de API - Apple Login");
        toast.error("Apple Login en desarrollo.");
    };

    const handleFacebookLogin = async () => {
        console.log("Pendiente de API - Facebook Login");
        toast.error("Facebook Login en desarrollo.");
    };

    const handleXLogin = async () => {
        console.log("Pendiente de API - X Login");
        toast.error("X Login en desarrollo.");
    };

    return (
        <div className="min-h-screen bg-[#0d0d12] flex flex-col items-center justify-center p-4 selection:bg-[#00FFCC] selection:text-black">
            <div className="bg-gray-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-gray-800 w-full max-w-md shadow-2xl">
                <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tighter uppercase">{APP_NAME}</h1>
                <p className="text-gray-400 mb-8 text-sm text-center">Crea tu cuenta de Creador</p>

                <form onSubmit={handleEmailRegister} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c2cdff] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c2cdff] transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-[#c2cdff] to-[#00FFCC] text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] transition-all disabled:opacity-50 mt-2"
                    >
                        {isLoading ? 'Creando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900/60 text-gray-500">O crea tu cuenta con</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="group w-full py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                        />
                        Google
                    </button>

                    <button
                        type="button"
                        onClick={handleAppleLogin}
                        className="group w-full py-3 px-4 bg-black text-white font-bold rounded-xl border border-gray-800 hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                        Apple
                    </button>

                    <button
                        type="button"
                        onClick={handleXLogin}
                        className="group w-full py-3 px-4 bg-black text-white font-bold rounded-xl border border-gray-800 hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
                    >
                        X (Twitter)
                    </button>

                    <button
                        type="button"
                        onClick={handleFacebookLogin}
                        className="group w-full py-3 px-4 bg-[#1877F2] text-white font-bold rounded-xl hover:bg-[#166fe5] transition-all flex items-center justify-center gap-3"
                    >
                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5 filter brightness-0 invert" />
                        Facebook
                    </button>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta? <a href="/dashboard/login" className="text-[#c2cdff] hover:underline">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
}
