import React from 'react';
import { APP_NAME } from '@/config/brand';

const VerifiedBadge = () => {
    return (
        <span className="inline-flex items-center justify-center p-0.5 ml-2 mt-1 align-middle relative group cursor-help">
            {/* Brillo de fondo sutil más grande para mejor detección táctil/hover */}
            <span className="absolute inset-0 bg-blue-400 rounded-full blur-[2px] opacity-40 group-hover:opacity-80 transition-opacity"></span>

            <svg
                className="w-5 h-5 text-blue-500 relative z-10 drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Sol o Estrella poligonal */}
                <path d="M12 2l2.4 3.2L18 4.6l1.2 3.8L22 10l-2.2 3.1.6 4-3.8 1.4-1.8 3.5L12 20l-2.8 2-1.8-3.5-3.8-1.4.6-4L2 10l2.8-1.6L6 4.6l3.6.6L12 2z" />
                {/* Palomita interior */}
                <path d="M10 15l-3-3 1.4-1.4 1.6 1.6 5-5L16.4 8l-6.4 6.4z" fill="white" />
            </svg>

            {/* Tooltip on hover - Mejorado con fondo sólido muy oscuro y texto blanco puro */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 px-3 py-2 text-[11px] font-bold text-white bg-black rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] border border-gray-800 text-center whitespace-normal leading-tight z-50 translate-y-2 group-hover:translate-y-0">
                Creador Verificado ✓
                <span className="block text-[9px] text-gray-400 font-medium mt-0.5">Identidad oficial confirmada</span>
                {/* Flechita del tooltip */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></span>
            </span>
        </span>
    );
};

export default VerifiedBadge;
