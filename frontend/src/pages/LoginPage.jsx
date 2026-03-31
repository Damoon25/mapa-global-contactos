import { Box } from "@mui/material";
import LoginCard from "../components/auth/LoginCard";

export default function LoginPage() {
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

      <LoginCard />
    </Box>
  );
}