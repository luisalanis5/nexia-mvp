'use client';

import React, { useState } from 'react';
import { db, auth } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/dashboard/ImageUploader';

export default function FeedbackManager() {
    const [type, setType] = useState<'bug' | 'suggestion' | 'improvement'>('improvement');
    const [message, setMessage] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // handleFileChange deleted since we use ImageUploader

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Por favor, escribe un mensaje");
            return;
        }

        setIsSubmitting(true);
        try {
            // Document write/update in feedback collection
            await addDoc(collection(db, 'feedback'), {
                userId: auth.currentUser?.uid,
                userEmail: auth.currentUser?.email,
                type,
                message,
                screenshotUrl, // Already uploaded by ImageUploader if any
                status: 'pending',
                createdAt: serverTimestamp()
            });

            toast.success("¡Gracias por tu feedback! Lo revisaremos pronto.");
            setMessage('');
            setScreenshotUrl(null);
            setType('improvement');
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Error al enviar. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                💡 Ayúdanos a mejorar Nuxira
            </h3>
            <p className="text-gray-400 text-sm mb-8">
                Tus sugerencias y reportes de errores son vitales para nosotros. Cuéntanos qué piensas o qué falló.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setType('bug')}
                        className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${type === 'bug' ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                    >
                        🪲 Reportar Error
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('improvement')}
                        className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${type === 'improvement' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                    >
                        🚀 Mejora
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('suggestion')}
                        className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${type === 'suggestion' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                    >
                        💡 Sugerencia
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Tu mensaje
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={type === 'bug' ? "¿Qué sucedió? ¿Cómo podemos replicarlo?" : "¿Qué nueva función te gustaría ver?"}
                        rows={5}
                        className="w-full bg-[#0d0d12] border border-gray-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/20 focus:border-[#00FFCC]/50 transition-all resize-none"
                    />
                </div>

                {type === 'bug' && (
                    <div className="space-y-4">
                        <ImageUploader
                            label="Captura de pantalla (Opcional)"
                            folder="feedback"
                            previewUrl={screenshotUrl}
                            onUploadSuccess={(url) => setScreenshotUrl(url)}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#00FFCC] to-blue-500 text-black font-black rounded-2xl hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                </button>
            </form>
        </div>
    );
}
