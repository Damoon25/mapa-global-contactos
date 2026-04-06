import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { signOut } from "../api/authApi";

export default function PendingPage() {
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: "linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          textAlign: "center",
          border: "1px solid rgba(36, 68, 159, 0.12)",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(36,68,159,0.12), rgba(36,68,159,0.22))",
              color: "#24449F",
              boxShadow: "0 10px 24px rgba(36, 68, 159, 0.14)",
            }}
          >
            <PendingActionsOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1E293B",
                mb: 1,
                fontSize: { xs: "1.8rem", sm: "2rem" },
              }}
            >
              Acceso pendiente
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                fontSize: "1rem",
                lineHeight: 1.7,
                maxWidth: 420,
                mx: "auto",
              }}
            >
              Tu usuario fue registrado correctamente, pero todavía no está
              habilitado para ingresar al mapa.
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 1,
              px: 2,
              py: 1.5,
              borderRadius: 3,
              background: "rgba(36, 68, 159, 0.06)",
              border: "1px solid rgba(36, 68, 159, 0.1)",
            }}
          >
            <Typography
              sx={{
                color: "#24449F",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Un administrador debe aprobar tu cuenta antes de continuar.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%", pt: 1 }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogout}
              startIcon={<LogoutRoundedIcon />}
              sx={{
                py: 1.25,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                background: "#24449F",
                boxShadow: "none",
                "&:hover": {
                  background: "#1d3a87",
                  boxShadow: "none",
                },
              }}
            >
              Volver al login
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
