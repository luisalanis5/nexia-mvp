import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export interface ProfileData {
    uid: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    theme: {
        primaryColor: string;
        mode: string;
        buttonStyle: string;
        fontFamily: string;
    };
    isVerified: boolean;
}

export interface LinkData {
    id: string;
    title: string;
    url: string;
    icon?: string;
    isActive: boolean;
    order: number;
}

export function useProfileData(username: string) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [links, setLinks] = useState<LinkData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!username) return;

        setLoading(true);

        // 1. Escuchar el documento público del perfil buscando por username
        const profilesRef = collection(db, 'profiles');
        const qProfile = query(profilesRef, where("username", "==", username.toLowerCase()));

        const unsubscribeProfile = onSnapshot(qProfile,
            (snapshot) => {
                if (!snapshot.empty) {
                    const docSnap = snapshot.docs[0];
                    const profileData = docSnap.data() as ProfileData;
                    setProfile({ ...profileData, uid: docSnap.id });

                    // 2. Escuchar subcolección de links en tiempo real de DICHO perfil
                    const linksRef = collection(db, `profiles/${docSnap.id}/links`);
                    // Se asume que mantenemos un orden visual con el campo 'order'
                    const qLinks = query(linksRef, where("isActive", "==", true), orderBy("order", "asc"));

                    const unsubscribeLinks = onSnapshot(qLinks, (linksSnapshot) => {
                        const linksData = linksSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as LinkData[];
                        setLinks(linksData);
                        setLoading(false);
                    }, (err) => {
                        console.error("[Nuxira DB] Error fetching links:", err);
                        setError(err);
                        setLoading(false);
                    });

                    // Cleanup the links listener when profile changes or unmounts
                    return () => unsubscribeLinks();

                } else {
                    setProfile(null);
                    setLinks([]);
                    setLoading(false);
                }
            },
            (err) => {
                console.error("[Nuxira DB] Error fetching profile:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribeProfile();
    }, [username]);

    return { profile, links, loading, error };
}
