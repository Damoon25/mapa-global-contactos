import { useState } from "react";
import { signInWithGoogle } from "../../api/authApi";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import GoogleIcon from "@mui/icons-material/Google";

export default function LoginCard() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 460,
        p: { xs: 3, sm: 4 },
        borderRadius: "28px",
        position: "relative",
        zIndex: 1,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow:
          "0 24px 70px rgba(15, 23, 42, 0.14), 0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Stack spacing={3}>
        <Box textAlign="center">
          <Box
            sx={{
              width: 58,
              height: 58,
              mx: "auto",
              mb: 2,
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(59,130,246,0.20))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <PublicIcon sx={{ fontSize: 30, color: "#2563eb" }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            Ingresar
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#475569",
              fontSize: "15px",
            }}
          >
            Accedé a tu mapa de contactos.
          </Typography>
        </Box>

        {errorMessage ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: "14px",
              alignItems: "center",
            }}
          >
            {errorMessage}
          </Alert>
        ) : null}

        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          startIcon={<GoogleIcon />}
          sx={{
            height: 54,
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "15px",
            color: "#0f172a",
            borderColor: "#dbe3ef",
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
            "&:hover": {
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          {loadingGoogle ? "Redirigiendo..." : "Continuar con Google"}
        </Button>
      </Stack>
    </Paper>
  );
}