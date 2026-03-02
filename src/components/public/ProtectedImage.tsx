'use client';
import React from 'react';

type ProtectedImageProps = {
    src: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
    fill?: boolean;
};

/**
 * ProtectedImage — Imagen con deterrentes anti-descarga:
 * • Clic derecho bloqueado (onContextMenu)
 * • Arrastre bloqueado (onDragStart)
 * • Selección de texto/imagen bloqueada (select-none, user-select: none)
 * • Safari iOS: bloquea el menú "Guardar Imagen" (WebkitTouchCallout: none)
 * • Webkit: bloquea arrastre nativo (WebkitUserDrag: none)
 */
export default function ProtectedImage({ src, alt = '', className = '', style = {}, fill = false }: ProtectedImageProps) {
    const prevent = (e: React.SyntheticEvent) => e.preventDefault();

    const protectedStyle = {
        WebkitUserDrag: 'none',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        pointerEvents: 'auto',
        ...style,
        ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : {}),
    } as React.CSSProperties;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={`select-none ${className}`}
            style={protectedStyle}
            onContextMenu={prevent}
            onDragStart={prevent}
            draggable={false}
        />
    );
}
