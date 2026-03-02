import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const { creatorId, postId, localUserId, isLiked } = await req.json();

        if (!creatorId || !postId || !localUserId) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: "Admin no inicializado" }, { status: 500 });
        }

        const postRef = adminDb.collection("creators").doc(creatorId).collection("feed_posts").doc(postId);

        if (isLiked) {
            await postRef.update({
                likedBy: admin.firestore.FieldValue.arrayRemove(localUserId)
            });
        } else {
            await postRef.update({
                likedBy: admin.firestore.FieldValue.arrayUnion(localUserId)
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en like de feed:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
