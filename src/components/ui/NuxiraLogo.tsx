import React from 'react';

type NuxiraLogoProps = React.SVGProps<SVGSVGElement> & {
    variant?: 'glow' | 'solid' | 'outline' | 'ghost';
};

export const NuxiraLogo: React.FC<NuxiraLogoProps> = ({
    className = '',
    variant = 'glow',
    ...props
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={`w-full h-full overflow-visible ${className}`}
            {...props}
        >
            <defs>
                <linearGradient id="nuxiraGradientGlobal" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c2cdff" />
                    <stop offset="100%" stopColor="#00FFCC" />
                </linearGradient>
                {variant === 'glow' && (
                    <filter id="nuxiraOuterGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                )}
            </defs>
            <g filter={variant === 'glow' ? 'url(#nuxiraOuterGlow)' : undefined}>
                {/* Cuadrado de fondo oscuro con borde de degradado */}
                <rect
                    x="2" y="2" width="96" height="96" rx="24" ry="24"
                    fill="#050505"
                    stroke="url(#nuxiraGradientGlobal)"
                    strokeWidth="4"
                />
                {/* Letras NX con degradado */}
                <text
                    x="50" y="54"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontWeight="800"
                    fontSize="44"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="url(#nuxiraGradientGlobal)"
                    letterSpacing="-1"
                >
                    NX
                </text>
            </g>
        </svg>
    );
};

export default NuxiraLogo;
