import { useEffect, useRef, useState } from "react";
import { signOut } from "../../api/authApi";

export default function UserMenu({ user, profile }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    profile?.tipo_mapa === "argentina" ? "Argentina" : "Global";

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          height: "50px",
          border: "1px solid #dbe3ef",
          background: "#ffffff",
          borderRadius: "999px",
          padding: "8px 12px",
          cursor: "pointer",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
        }}
      >
        <img
          src={avatar}
          alt={fullName}
          referrerPolicy="no-referrer"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

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
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "290px",
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

          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
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
