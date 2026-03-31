import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SidePanel({
  open = false,
  onClose,
  title,
  subtitle,
  children,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <Box className={`side-panel ${open ? "open" : ""}`}>
      <Box className="side-panel-header">
        <Box className="side-panel-header-glow" />

        <Stack spacing={0.6} className="side-panel-header-content">
          <Typography className="side-panel-title">{title}</Typography>

          {subtitle ? (
            <Typography className="side-panel-subtitle">{subtitle}</Typography>
          ) : null}
        </Stack>

        <IconButton className="side-panel-close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        className="side-panel-content"
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          className="side-panel-inner"
          sx={{
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </Box>

        <Box
          className="side-panel-footer"
          sx={{
            pt: 2,
            mt: 2,
          }}
        >
          <Divider
            sx={{
              mb: 1.5,
              borderColor: "rgba(185, 191, 200, 0.9)",
            }}
          />

          <Typography
            sx={{
              textAlign: "center",
              fontSize: "0.78rem",
              color: "#68717d",
              lineHeight: 1.6,
              px: 1,
            }}
          >
            © {currentYear} Damoon · Todos los derechos reservados.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
