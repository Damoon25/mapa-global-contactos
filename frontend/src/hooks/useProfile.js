import { useEffect, useState } from "react";
import { getProfile } from "../api/authApi";

export default function useProfile(user) {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!user?.id) {
            setProfile(null);
            setLoadingProfile(false);
            return;
        }

        let active = true;

        const loadProfile = async () => {
            try {
                setLoadingProfile(true);
                const data = await getProfile(user.id);

                if (active) {
                    setProfile(data);
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
    }, [user]);

    return { profile, loadingProfile };
}