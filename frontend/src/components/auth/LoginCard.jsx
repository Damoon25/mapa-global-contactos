import { useState } from "react";
import {
  getAuthorizedUser,
  signInWithEmail,
  signInWithGoogle,
} from "../../api/authApi";

export default function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      setLoadingEmail(true);
      setErrorMessage("");

      const normalizedEmail = email.trim().toLowerCase();

      await getAuthorizedUser(normalizedEmail);
      await signInWithEmail({
        email: normalizedEmail,
        password,
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Email login error:", error);
      setErrorMessage("Credenciales inválidas o usuario no autorizado.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage("");
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("No se pudo iniciar sesión con Google.");
      setLoadingGoogle(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "32px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: "10px" }}>Ingresar</h1>

      <p style={{ marginTop: 0, marginBottom: "24px", color: "#475569" }}>
        Accedé a tu mapa de contactos.
      </p>

      <form onSubmit={handleEmailLogin}>
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuemail@empresa.com"
            autoComplete="email"
            required
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresá tu contraseña"
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loadingEmail}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "14px",
            padding: "14px 16px",
            fontWeight: 700,
            cursor: "pointer",
            background: "#2563eb",
            color: "#fff",
          }}
        >
          {loadingEmail ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "18px 0",
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        <span>o</span>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loadingGoogle}
        style={{
          width: "100%",
          border: "1px solid #cbd5e1",
          borderRadius: "14px",
          padding: "14px 16px",
          fontWeight: 700,
          cursor: "pointer",
          background: "#ffffff",
          color: "#0f172a",
        }}
      >
        {loadingGoogle ? "Redirigiendo..." : "Continuar con Google"}
      </button>

      {errorMessage ? (
        <p
          style={{
            marginTop: "16px",
            marginBottom: 0,
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
