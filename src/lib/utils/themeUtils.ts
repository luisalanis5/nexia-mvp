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
