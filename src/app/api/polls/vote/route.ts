import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const { creatorId, pollId, optionId } = await req.json();
        if (!creatorId || !pollId || optionId === undefined) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: "Admin no inicializado" }, { status: 500 });
        }

        const pollRef = adminDb.collection("creators").doc(creatorId).collection("modules").doc(pollId);
        const voteRef = pollRef.collection("votes").doc();

        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(pollRef);
            let results: any = {};

            if (!doc.exists) {
                // Auto-crear la encuesta si no existe para evitar error 500
                const baseData = {
                    id: pollId,
                    type: "poll",
                    title: "Encuesta Automática",
                    active: true,
                    props: {
                        question: "",
                        options: [],
                        results: { [optionId]: 1 },
                        totalVotes: 1
                    }
                };
                t.set(pollRef, baseData);
            } else {
                const data = doc.data() || {};
                const props = data.props || {};
                results = props.results || {};

                // Inicializar el resultado de la opción si no existe
                const currentVotes = results[optionId] || 0;
                results[optionId] = currentVotes + 1;

                // Calcular total de votos de forma segura iterando results
                let totalVotes = 0;
                Object.values(results).forEach((val: any) => totalVotes += val);

                // Actualizar los conteos atómicamente en el documento principal
                t.update(pollRef, {
                    "props.results": results,
                    "props.totalVotes": totalVotes
                });
            }

            // guardar el log en la subcolección
            t.set(voteRef, {
                optionId,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en transacción de voto:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
