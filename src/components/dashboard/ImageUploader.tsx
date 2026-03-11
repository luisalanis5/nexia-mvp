'use client';

import React, { useState, useRef } from 'react';
import { storage, auth } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
    onUploadSuccess: (url: string) => void;
    label?: string;
    folder?: string;
    className?: string;
    aspectRatio?: 'square' | 'video' | 'any';
    previewUrl?: string | null;
}

export default function ImageUploader({
    onUploadSuccess,
    label = "Subir Imagen",
    folder = "uploads",
    className = "",
    aspectRatio = 'any',
    previewUrl: initialPreview = null
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState<string | null>(initialPreview);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sincronizar vista previa local con prop inicial (útil cuando los datos cargan asíncronamente)
    React.useEffect(() => {
        setPreview(initialPreview);
    }, [initialPreview]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validaciones básicas
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecciona un archivo de imagen válido.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("La imagen es demasiado grande. Máximo 5MB.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            toast.error("Debes estar autenticado para subir imágenes.");
            return;
        }

        setIsUploading(true);
        setProgress(0);

        // Crear una vista previa local inmediata
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        try {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storagePath = `creators/${user.uid}/${folder}/${fileName}`;
            const storageRef = ref(storage, storagePath);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress);
                },
                (error) => {
                    console.error("Upload error:", error);
                    toast.error("Error al subir la imagen.");
                    setIsUploading(false);
                    setPreview(initialPreview);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onUploadSuccess(downloadURL);
                    setIsUploading(false);
                    toast.success("¡Imagen subida con éxito!");
                }
            );

        } catch (error) {
            console.error("Error initiating upload:", error);
            toast.error("Error al iniciar la subida.");
            setIsUploading(false);
            setPreview(initialPreview);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    {label}
                </label>

                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`relative group cursor-pointer overflow-hidden border-2 border-dashed transition-all rounded-2xl flex flex-col items-center justify-center p-4 min-h-[140px]
                        ${preview ? 'border-gray-800' : 'border-gray-800 hover:border-[#00FFCC]/50 bg-gray-900/20'}
                        ${isUploading ? 'pointer-events-none' : ''}`}
                >
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Preview"
                                className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${isUploading ? 'opacity-40' : 'opacity-100'}`}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none'; // Ocultar si está rota
                                }}
                            />
                            {!isUploading && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-xl">
                                    <span className="text-white font-bold text-xs uppercase tracking-tighter">Cambiar Imagen</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">📷</span>
                            </div>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hacer clic para subir</span>
                        </>
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/10">
                            <div className="w-full max-w-[120px] h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00FFCC] to-blue-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-[#00FFCC] animate-pulse">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
}
