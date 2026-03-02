import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    if (!adminDb) {
        return NextResponse.json({ error: 'DB no inicializada' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { creatorId, content } = body;

        if (!creatorId || !content) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // Se guarda en collection root 'questions' o en subcollecion? En el cliente era collection(db, 'questions')
        // Lo adaptamos a 'questions' root para que coincida con lo que esperaba el cliente:
        const questionsRef = adminDb.collection('questions');

        await questionsRef.add({
            receiverId: creatorId,
            content: content.trim(),
            isAnswered: false,
            createdAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en QA API:", error);
        return NextResponse.json({ error: 'Error procesando la pregunta' }, { status: 500 });
    }
}
