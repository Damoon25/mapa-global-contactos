import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";

export default function FullScreenLoader({
  title = "Validando acceso...",
  subtitle = "Estamos preparando tu experiencia.",
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #eef4ff 0%, #f8fbff 45%, #f8fafc 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.10)",
          filter: "blur(90px)",
          top: -120,
          left: -80,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.10)",
          filter: "blur(90px)",
          bottom: -120,
          right: -80,
          pointerEvents: "none",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 4, sm: 5 },
          borderRadius: "28px",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow:
            "0 24px 70px rgba(15, 23, 42, 0.14), 0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 62,
              height: 62,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(59,130,246,0.20))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <PublicIcon sx={{ fontSize: 32, color: "#2563eb" }} />
          </Box>

          <CircularProgress
            size={40}
            thickness={5.5}
            sx={{ color: "#35569e" }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              maxWidth: 320,
              color: "#475569",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
