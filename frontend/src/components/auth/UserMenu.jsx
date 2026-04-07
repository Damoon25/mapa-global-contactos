import { useEffect, useRef, useState } from "react";
import { signOut } from "../../api/authApi";

export default function UserMenu({ user, profile, authorizedUser }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const avatar =
    user?.user_metadata?.avatar_url || "https://via.placeholder.com/40?text=U";

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    profile?.nombre_completo ||
    "Usuario";

  const email = user?.email || profile?.email || "";

  const accessLabel =
    authorizedUser?.tipo_mapa === "argentina"
      ? "Argentina"
      : authorizedUser?.tipo_mapa === "publico"
        ? "Público"
        : "Global";

  const roleLabel =
    authorizedUser?.rol === "admin"
      ? "Admin"
      : authorizedUser?.rol === "viewer"
        ? "Viewer"
        : "Viewer";

  return (
    <div
      ref={menuRef}
      className="topbar-user-menu"
      style={{
        position: "relative",
        width: isMobile ? "34px" : "auto",
        minWidth: isMobile ? "34px" : "auto",
      }}
    >
      <button
        className="topbar-user-menu__trigger"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "0px" : "10px",
          width: isMobile ? "34px" : "auto",
          minWidth: isMobile ? "34px" : "auto",
          height: isMobile ? "34px" : "50px",
          border: "1px solid #dbe3ef",
          background: "#ffffff",
          borderRadius: "999px",
          padding: isMobile ? "0px" : "8px 12px",
          cursor: "pointer",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
          overflow: "hidden",
        }}
      >
        <img
          src={avatar}
          alt={fullName}
          referrerPolicy="no-referrer"
          style={{
            width: isMobile ? "30px" : "34px",
            height: isMobile ? "30px" : "34px",
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        {!isMobile && (
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#1e293b",
              maxWidth: "130px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {fullName}
          </span>
        )}
      </button>

      {open && (
        <div
          className="topbar-user-menu__dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "290px",
            maxWidth: "calc(100vw - 24px)",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.16)",
            padding: "16px",
            zIndex: 9999,
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <img
              src={avatar}
              alt={fullName}
              referrerPolicy="no-referrer"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {fullName}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  wordBreak: "break-word",
                }}
              >
                {email}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "14px",
              padding: "10px 12px",
              borderRadius: "14px",
              background: "#f8fafc",
              fontSize: "13px",
              color: "#334155",
            }}
          >
            Acceso: <strong>{accessLabel}</strong>
          </div>

          <div
            style={{
              marginTop: "10px",
              padding: "10px 12px",
              borderRadius: "14px",
              background: "#f8fafc",
              fontSize: "13px",
              color: "#334155",
            }}
          >
            Perfil: <strong>{roleLabel}</strong>
          </div>

          <button
            className="topbar-user-menu__logout"
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "block",
              marginTop: "14px",
              border: "none",
              borderRadius: "14px",
              padding: "12px 14px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}