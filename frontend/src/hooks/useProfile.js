import { useEffect, useRef, useState } from "react";
import { getProfile } from "../api/authApi";

export default function useProfile(user) {
    const userId = user?.id ?? null;

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const lastLoadedUserIdRef = useRef(null);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setLoadingProfile(false);
            lastLoadedUserIdRef.current = null;
            return;
        }

        let active = true;

        const loadProfile = async () => {
            try {
                const isSameUserAlreadyLoaded =
                    lastLoadedUserIdRef.current === userId && profile !== null;

                if (!isSameUserAlreadyLoaded) {
                    setLoadingProfile(true);
                }

                const data = await getProfile(userId);

                if (active) {
                    setProfile(data);
                    lastLoadedUserIdRef.current = userId;
                }
            } catch (error) {
                console.error("Profile load error:", error);
            } finally {
                if (active) {
                    setLoadingProfile(false);
                }
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return { profile, loadingProfile };
}