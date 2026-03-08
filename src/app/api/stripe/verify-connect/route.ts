import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
    apiVersion: '2025-02-24.acacia' as any,
});

/**
 * POST /api/stripe/verify-connect
 * Called when the user returns from Stripe Onboarding (return_url or refresh_url).
 * Retrieves the Stripe account and checks if details_submitted === true.
 * Only marks stripeSetupComplete: true in Firestore if fully verified.
 */
export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID requerido' }, { status: 400 });
        }

        if (!adminDb) {
            throw new Error('Firebase admin database no está inicializada');
        }

        const creatorRef = adminDb.collection('creators').doc(uid);
        const creatorDoc = await creatorRef.get();

        if (!creatorDoc.exists) {
            return NextResponse.json({ error: 'Creador no encontrado' }, { status: 404 });
        }

        const creatorData = creatorDoc.data();
        const stripeAccountId = creatorData?.stripeAccountId;

        if (!stripeAccountId) {
            // No account started at all
            return NextResponse.json({ status: 'not_started', detailsSubmitted: false });
        }

        // Retrieve live account status from Stripe
        const account = await stripe.accounts.retrieve(stripeAccountId);
        const detailsSubmitted = account.details_submitted === true;
        const chargesEnabled = account.charges_enabled === true;

        if (detailsSubmitted) {
            // Mark as fully set up in Firestore
            await creatorRef.update({ stripeSetupComplete: true });
        } else {
            // Ensure it stays false if they didn't finish
            await creatorRef.update({ stripeSetupComplete: false });
        }

        return NextResponse.json({
            status: detailsSubmitted ? 'complete' : 'incomplete',
            detailsSubmitted,
            chargesEnabled,
        });

    } catch (error: any) {
        console.error('[verify-connect] Error:', error);
        return NextResponse.json(
            { error: 'Error verificando cuenta de Stripe', details: error.message },
            { status: 500 }
        );
    }
}
