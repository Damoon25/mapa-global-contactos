import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useSession from "../../hooks/useSession";
import { getAuthorizedUser, signOut } from "../../api/authApi";
import FullScreenLoader from "../common/FullScreenLoader";

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
        const authorizedUser = await getAuthorizedUser({
          userId: session.user.id,
          email: session.user.email,
        });

        if (!authorizedUser) {
          setIsAuthorized("pending");
          return;
        }

        if (!authorizedUser.activo) {
          setIsAuthorized("pending");
          return;
        }

        setIsAuthorized(true);
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
    return (
      <FullScreenLoader
        title="Validando acceso..."
        subtitle="Estamos comprobando tu sesión para ingresar al mapa."
      />
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthorized === "pending") {
    return <Navigate to="/pending" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
