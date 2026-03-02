import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe (use a fallback for local dev if env is missing)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { creatorId, amount, currency = 'usd', redirectUrl = 'http://localhost:3000' } = body;

        if (!creatorId || !amount) {
            return NextResponse.json({ error: 'Missing creatorId or amount' }, { status: 400 });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Propina para Creador',
                            description: `Apoyo directo al creador`,
                        },
                        unit_amount: amount, // amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${redirectUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${redirectUrl}?canceled=true`,
            metadata: {
                creatorId: creatorId,
                type: 'tip'
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error creating Stripe session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
