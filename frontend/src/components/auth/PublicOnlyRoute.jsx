import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useSession from "../../hooks/useSession";
import { getAuthorizedUser } from "../../api/authApi";
import FullScreenLoader from "../common/FullScreenLoader";

export default function PublicOnlyRoute({ children }) {
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
        console.error("Public route auth error:", error);
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
        subtitle="Estamos verificando tu sesión actual."
      />
    );
  }

  if (isAuthorized === "pending") {
    return <Navigate to="/pending" replace />;
  }

  if (session && isAuthorized === true) {
    return <Navigate to="/" replace />;
  }

  return children;
}