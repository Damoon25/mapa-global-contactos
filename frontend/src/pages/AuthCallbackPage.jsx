import { useEffect } from "react";
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

        const authorizedUser = await getAuthorizedUser(
          user.email.trim().toLowerCase()
        );

        if (!authorizedUser) {
          await signOut();
          navigate("/login", { replace: true });
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