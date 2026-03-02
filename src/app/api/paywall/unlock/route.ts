import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
    try {
        const { moduleId, creatorId } = await req.json();

        if (!moduleId || !creatorId) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Simulación de validación de pago. En prod: Verificar firma de Stripe UI (Webhook/JWT)
        const isPaymentValid = true; // MVP simula que el pago siempre es exitoso una vez convocado

        if (!isPaymentValid) {
            return NextResponse.json({ success: false, error: 'Payment required' }, { status: 403 });
        }

        if (!adminDb) {
            return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
        }

        // 2. Extraer el secretContent del creador de forma segura desde adminDb
        const creatorDoc = await adminDb.collection('creators').doc(creatorId).get();
        if (!creatorDoc.exists) {
            return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
        }

        const data = creatorDoc.data();
        const modules = data?.modules || [];

        // Búsqueda exhaustiva del módulo
        const lockedModule = modules.find((m: any) => (m.id === moduleId || m.moduleId === moduleId) && m.type === 'locked');

        if (!lockedModule) {
            console.error(`[PAYWALL API]: Module ${moduleId} not found in creator ${creatorId}`);
            return NextResponse.json({ success: false, error: 'Módulo no encontrado en el perfil del creador.' }, { status: 404 });
        }

        if (!lockedModule.props || !lockedModule.props.secretContent) {
            console.error(`[PAYWALL API]: Module ${moduleId} exists but has no secretContent props.`);
            return NextResponse.json({ success: false, error: 'El contenido secreto no está configurado correctamente.' }, { status: 404 });
        }

        console.log(`[PAYWALL API]: Success! Unlocked ${moduleId} for creator ${creatorId}`);
        return NextResponse.json({ success: true, secretContent: lockedModule.props.secretContent });
    } catch (error: any) {
        console.error("[PAYWALL API ERROR]:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Error interno al procesar el desbloqueo."
        }, { status: 500 });
    }
}
