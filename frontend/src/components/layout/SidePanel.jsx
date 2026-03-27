import { Box, IconButton, Stack, Typography, Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";

export default function SidePanel({
  open,
  title = "Mapa de contactos",
  subtitle = "Directorio internacional",
  onClose,
  children,
}) {
  return (
    <>
      <Box className={`side-panel ${open ? "side-panel--open" : ""}`}>
        <Box className="side-panel-header">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar className="drawer-avatar">
                <PlaceIcon />
              </Avatar>

              <Box>
                <Typography className="drawer-title">{title}</Typography>
                <Typography variant="body2" className="drawer-subtitle">
                  {subtitle}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box className="side-panel-body">{children}</Box>
      </Box>
    </>
  );
}
