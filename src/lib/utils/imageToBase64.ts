/**
 * Convierte un File a Base64 comprimido (máx. 800px, JPEG 0.75).
 * Sirve para guardar imágenes en Firestore sin necesitar Firebase Storage.
 */
export function imageFileToBase64(file: File, maxPx = 800, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();

        reader.onload = (ev) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height && width > maxPx) {
                    height = Math.round((height * maxPx) / width);
                    width = maxPx;
                } else if (height > maxPx) {
                    width = Math.round((width * maxPx) / height);
                    height = maxPx;
                }

                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = ev.target!.result as string;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
