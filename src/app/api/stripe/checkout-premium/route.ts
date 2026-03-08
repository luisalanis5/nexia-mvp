import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
    apiVersion: '2025-02-24.acacia' as any,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(req: Request) {
    try {
        const requestHeaders = await headers();
        const origin = requestHeaders.get('origin') || APP_URL;

        // Frontend must send { uid } in the body so we can track who subscribed
        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID requerido' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            // client_reference_id links the session to the Firebase UID so the webhook
            // can find the creator in Firestore after payment completes.
            client_reference_id: uid,
            line_items: [
                {
                    price: process.env.STRIPE_PREMIUM_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Error creating stripe checkout session:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
