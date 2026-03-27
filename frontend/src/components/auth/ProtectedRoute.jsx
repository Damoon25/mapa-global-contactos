import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useSession from "../../hooks/useSession";
import { getAuthorizedUser, signOut } from "../../api/authApi";

export default function ProtectedRoute({ children }) {
  const { session, loadingSession } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!session?.user?.email) {
        setIsAuthorized(false);
        return;
      }

      try {
        const authorizedUser = await getAuthorizedUser(
          session.user.email.trim().toLowerCase()
        );

        setIsAuthorized(!!authorizedUser);
      } catch (error) {
        console.error("Authorization check error:", error);
        await signOut();
        setIsAuthorized(false);
      }
    };

    if (!loadingSession) {
      checkAuthorization();
    }
  }, [session, loadingSession]);

  if (loadingSession || isAuthorized === null) {
    return <p style={{ padding: "24px" }}>Validando acceso...</p>;
  }

  if (!session || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}