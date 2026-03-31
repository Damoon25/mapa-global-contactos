import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuthorizedUser,
  signInWithEmail,
  signInWithGoogle,
} from "../../api/authApi";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import GoogleIcon from "@mui/icons-material/Google";

export default function LoginCard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = loadingEmail || loadingGoogle;

  const emailError = useMemo(() => {
    if (!email.trim()) return "";
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return validEmail ? "" : "Ingresá un email válido.";
  }, [email]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      setLoadingEmail(true);
      setErrorMessage("");

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password.trim()) {
        setErrorMessage("Completá email y contraseña.");
        return;
      }

      if (emailError) {
        setErrorMessage(emailError);
        return;
      }

      await getAuthorizedUser(normalizedEmail);
      await signInWithEmail({
        email: normalizedEmail,
        password,
      });

      navigate("/", { replace: true });
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

        <Box component="form" onSubmit={handleEmailLogin}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@empresa.com"
              autoComplete="email"
              required
              fullWidth
              disabled={isSubmitting}
              error={Boolean(emailError)}
              helperText={emailError || " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "#f8fbff",
                },
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresá tu contraseña"
              autoComplete="current-password"
              required
              fullWidth
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "#f8fbff",
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{
                mt: 1,
                height: 54,
                borderRadius: "16px",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "15px",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
              }}
            >
              {loadingEmail ? "Ingresando..." : "Ingresar"}
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "#64748b",
          }}
        >
          <Divider sx={{ flex: 1 }} />
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 600 }}
          >
            o
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
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