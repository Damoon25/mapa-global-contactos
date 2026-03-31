import { Navigate } from "react-router-dom";
import useSession from "../../hooks/useSession";
import FullScreenLoader from "../common/FullScreenLoader";

export default function PublicOnlyRoute({ children }) {
  const { session, loadingSession } = useSession();

  if (loadingSession) {
    return (
      <FullScreenLoader
        title="Validando acceso..."
        subtitle="Estamos verificando tu sesión actual."
      />
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children;
}