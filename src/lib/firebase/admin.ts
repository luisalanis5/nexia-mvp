import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!rawKey) {
      throw new Error("❌ FIREBASE_PRIVATE_KEY no encontrada en .env.local");
    }

    // NORMALIZACIÓN DE ALTA PRECISIÓN:
    // 1. Eliminamos comillas accidentales (simples o dobles) al inicio y final.
    // 2. Reemplazamos los '\\n' literales por saltos de línea reales '\n'.
    // 3. Trim para eliminar espacios invisibles que Windows suele añadir.
    const formattedKey = rawKey
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey,
      }),
    });

    console.log("🚀 Firebase Admin inicializado con éxito");
  } catch (error: any) {
    // Esto imprimirá el error específico para saber si es la llave o las credenciales
    console.error("❌ Error crítico en Firebase Admin:", error.message);
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminStorage = admin.apps.length ? admin.storage() : null;