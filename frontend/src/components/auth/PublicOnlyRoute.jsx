import { Navigate } from "react-router-dom";
import useSession from "../../hooks/useSession";

export default function PublicOnlyRoute({ children }) {
  const { session, loadingSession } = useSession();

  if (loadingSession) {
    return <p style={{ padding: "24px" }}>Cargando sesión...</p>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children;
}