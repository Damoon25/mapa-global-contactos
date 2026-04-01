import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function useSession() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      setSession(session ?? null);
      setLoadingSession(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession((prevSession) => {
        const prevUserId = prevSession?.user?.id ?? null;
        const nextUserId = nextSession?.user?.id ?? null;
        const prevAccessToken = prevSession?.access_token ?? null;
        const nextAccessToken = nextSession?.access_token ?? null;

        if (
          prevUserId === nextUserId &&
          prevAccessToken === nextAccessToken
        ) {
          return prevSession;
        }

        return nextSession ?? null;
      });

      setLoadingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loadingSession };
}