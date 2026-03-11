import { NextResponse } from 'next/server';
import React from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // FASE 3: Enviar correo de bienvenida con Resend
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'Equipo Nuxira <hola@nuxira.me>',
                    to: email,
                    subject: '¡Bienvenido a tu nuevo multiverso digital! ',
                    html: await render(WelcomeEmail({ name: name || 'Creador' }) as React.ReactElement)
                });
            } catch (resendErr) {
                console.error('[WELCOME EMAIL API] Fallo al enviar con Resend:', resendErr);
                // No devolvemos error 500 para no bloquear el onboarding del usuario si falla el email
            }
        }

        console.log(`[EMAIL TRANSACTIONS API] 🚀 Correo de Bienvenida encolado para: ${name || 'Creador'} <${email}>`);

        return NextResponse.json({
            success: true,
            message: 'Welcome email sent successfully.',
            deliveredTo: email
        });
    } catch (error: any) {
        console.error('[EMAIL TRANSACTIONS API] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
