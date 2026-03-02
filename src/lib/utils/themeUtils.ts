import { getLuminance } from 'polished';

/**
 * Calculates whether the text on top of the given hex color should be dark or light
 * based on the luminance of the background color. 
 * Recomended W3C threshold for contrast is usually ~0.179.
 * 
 * @param hexColor The background color in hexadecimal format (e.g. #00FFCC)
 * @returns '#111827' (gray-900) for bright backgrounds, '#FFFFFF' (white) for dark backgrounds.
 */
export function getContrastText(hexColor: string): string {
    try {
        const luminance = getLuminance(hexColor);
        // If the color is bright (luminance > 0.4), use dark text. Otherwise use light text.
        return luminance > 0.4 ? '#111827' : '#FFFFFF';
    } catch {
        // Fallback robusto en caso de un color inválido
        return '#FFFFFF';
    }
}

/**
 * Función de auto-contraste real (YIQ) requerida.
 * Evalúa el color hexadecimal y devuelve explícitamente la clase de Tailwind de texto apropiada.
 */
export function getContrastYIQ(hexcolor: string): string {
    try {
        const hex = hexcolor.replace('#', '');

        // Extraer valores RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Calcular la luminancia usando ecuación YIQ
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        // Si el color es claro (yiq >= 128), el texto debe ser gris oscuro. Si es oscuro, texto blanco.
        return yiq >= 128 ? 'text-gray-900' : 'text-white';
    } catch (error) {
        return 'text-white'; // Fallback
    }
}

