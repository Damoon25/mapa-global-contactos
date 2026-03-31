import { Box, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SidePanel({
  open = false,
  onClose,
  title,
  subtitle,
  children,
}) {
  return (
    <Box className={`side-panel ${open ? "open" : ""}`}>
      <Box className="side-panel-header">
        <Box className="side-panel-header-glow" />

        <Stack spacing={0.6} className="side-panel-header-content">
          <Typography className="side-panel-title">
            {title}
          </Typography>

          {subtitle ? (
            <Typography className="side-panel-subtitle">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>

        <IconButton className="side-panel-close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box className="side-panel-content">
        <Box className="side-panel-inner">
          {children}
        </Box>
      </Box>
    </Box>
  );
}