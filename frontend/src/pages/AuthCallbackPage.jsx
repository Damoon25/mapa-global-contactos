import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getAuthorizedUser,
  createOrUpdateProfileFromAuthorizedUser,
  signOut,
} from "../api/authApi";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const processLogin = async () => {
      try {
        const user = await getCurrentUser();

        if (!user?.email) {
          await signOut();
          navigate("/login", { replace: true });
          return;
        }

        const normalizedEmail = user.email.trim().toLowerCase();

        const authorizedUser = await getAuthorizedUser(normalizedEmail);

        if (!authorizedUser) {
          const { error } = await supabase
            .from("usuarios_autorizados")
            .upsert(
              {
                email: normalizedEmail,
                tipo_mapa: "global",
                activo: false,
              },
              { onConflict: "email" },
            );

          if (error) {
            console.error("Error creating pending authorized user:", error);
          }

          navigate("/pending", { replace: true });
          return;
        }

        if (!authorizedUser.activo) {
          navigate("/pending", { replace: true });
          return;
        }

        await createOrUpdateProfileFromAuthorizedUser(user, authorizedUser);

        navigate("/", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error?.message || error);
        console.error("Full auth callback error:", error);
        await signOut();
        navigate("/login", { replace: true });
      }
    };

    processLogin();
  }, [navigate]);

  return <p style={{ padding: "24px" }}>Procesando inicio de sesión...</p>;
}