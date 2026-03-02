'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface NewsFeedProps {
    id: string;
    creatorId: string;
    title?: string;
}

export default function NewsFeed({ id, creatorId, title = "Últimas Novedades" }: NewsFeedProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [localUserId, setLocalUserId] = useState<string>('');

    useEffect(() => {
        let uid = localStorage.getItem('nexia_local_uid');
        if (!uid) {
            uid = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('nexia_local_uid', uid);
        }
        setLocalUserId(uid);

        // Bloqueo de variables indefinidas y prevención de rutas malformadas
        if (!creatorId || typeof creatorId !== 'string' || creatorId.includes('undefined')) return;
        if (id && id.startsWith('temp-')) return;

        // Escuchamos la colección feed_posts dentro del documento del creador
        const feedRef = collection(db, 'creators', creatorId, 'feed_posts');
        const q = query(feedRef, orderBy('createdAt', 'desc'), limit(10));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newPosts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts((prev) => {
                    const isEqual = JSON.stringify(prev) === JSON.stringify(newPosts);
                    return isEqual ? prev : newPosts;
                });
            },
            (error) => {
                console.error("[FIREBASE DEBUG] Fallo onSnapshot en módulo: feed | ID:", id, " | Creador:", creatorId, " | Error:", error.message);
            }
        );

        return () => unsubscribe();
    }, [creatorId, id]);

    if (posts.length === 0) return null;

    const handleLike = async (post: any) => {
        if (!localUserId) return;
        const postId = post.id;
        const isLiked = post.likedBy?.includes(localUserId);

        // Optimistic UI
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const currentLikedBy = p.likedBy || [];
                return {
                    ...p,
                    likedBy: isLiked ? currentLikedBy.filter((id: string) => id !== localUserId) : [...currentLikedBy, localUserId]
                };
            }
            return p;
        }));

        try {
            const postRef = doc(db, 'creators', creatorId, 'feed_posts', postId);
            if (isLiked) {
                await updateDoc(postRef, { likedBy: arrayRemove(localUserId) });
            } else {
                await updateDoc(postRef, { likedBy: arrayUnion(localUserId) });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            // Si falla, el onSnapshot corregirá el estado tarde o temprano
        }
    };

    return (
        <div className="w-full my-6">
            {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}

            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-5 border border-gray-800 shadow-lg relative overflow-hidden group transition-all hover:bg-gray-800/80">
                        {/* Acento Neon a la izquierda */}
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-3 whitespace-pre-wrap">
                            {post.content}
                        </p>

                        {post.imageUrl && (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3 border border-gray-700/50">
                                <Image src={post.imageUrl} alt="Post Attach" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                            </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500 font-medium border-t border-gray-800/50 pt-3 mt-2">
                            <span>{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reciente'}</span>
                            <button
                                onClick={() => handleLike(post)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${post.likedBy?.includes(localUserId)
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                                    }`}
                            >
                                <motion.span
                                    animate={post.likedBy?.includes(localUserId) ? { scale: [1, 1.5, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    {post.likedBy?.includes(localUserId) ? '💖' : '🤍'}
                                </motion.span>
                                <span>{post.likedBy?.length || post.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
