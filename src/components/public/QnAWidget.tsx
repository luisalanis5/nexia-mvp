'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase/client';
// no firebase/firestore imports for writes needed

type QnAWidgetProps = {
    creatorId: string;
    title: string;
    placeholder: string;
};

export default function QnAWidget({ title, placeholder, creatorId }: QnAWidgetProps) {
    const [question, setQuestion] = useState('');
    const [sent, setSent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && creatorId && !isSending) {
            setIsSending(true);
            try {
                const res = await fetch('/api/qa/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creatorId, content: question.trim() })
                });

                if (!res.ok) {
                    throw new Error('Error al enviar la pregunta');
                }

                setSent(true);
                setQuestion('');
                setTimeout(() => setSent(false), 3000);
            } catch (err) {
                console.error("Error sending question:", err);
            } finally {
                setIsSending(false);
            }
        }
    };

    return (
        <div className="w-full bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0" />

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>💬</span> {title}
                </h3>

                {sent ? (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl text-center font-medium animate-pulse">
                        ¡Mensaje anónimo enviado!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={placeholder}
                            rows={2}
                            disabled={isSending}
                            className="w-full min-h-[44px] bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!question.trim() || isSending}
                            className="w-full min-h-[44px] py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                            {isSending ? 'Enviando...' : 'Enviar Anónimamente'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
