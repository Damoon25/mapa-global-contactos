import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ContactList({
  contacts = [],
  selectedContactId = null,
  loading = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 3,
          textAlign: "center",
          borderStyle: "dashed",
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Cargando contactos...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!contacts.length) {
    return (
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 3,
          borderStyle: "dashed",
          bgcolor: "grey.50",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            No hay contactos para mostrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Agregá un contacto desde el panel para empezar a poblar el mapa.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {contacts.map((contact) => {
        const isSelected = String(contact.id) === String(selectedContactId);
        const countryName = contact.paises?.nombre || "Sin país";
        const company = contact.empresa || "Sin empresa";
        const role = contact.cargo || "Sin cargo";

        return (
          <Paper
            key={contact.id}
            variant="outlined"
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              borderColor: isSelected ? "primary.main" : "divider",
              boxShadow: isSelected
                ? "0 10px 30px rgba(37, 99, 235, 0.14)"
                : "0 8px 24px rgba(15, 23, 42, 0.04)",
              transition: "all 0.2s ease",
            }}
          >
            <ListItemButton
              onClick={() => onSelect?.(contact)}
              sx={{
                alignItems: "flex-start",
                px: 1.5,
                py: 1.5,
                bgcolor: isSelected ? "rgba(37, 99, 235, 0.06)" : "transparent",
                "&:hover": {
                  bgcolor: isSelected
                    ? "rgba(37, 99, 235, 0.08)"
                    : "rgba(15, 23, 42, 0.03)",
                },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    fontSize: 14,
                    fontWeight: 700,
                    bgcolor: isSelected ? "primary.main" : "grey.200",
                    color: isSelected ? "primary.contrastText" : "text.primary",
                    mt: 0.25,
                  }}
                >
                  {getInitials(contact.nombre) || "C"}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "75%",
                          }}
                        >
                          {contact.nombre || "Sin nombre"}
                        </Typography>

                        <Stack direction="row" spacing={0.25}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEdit?.(contact);
                              }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDelete?.(contact);
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.75} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <WorkOutlineOutlinedIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {role}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <BusinessOutlinedIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {company}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PublicOutlinedIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {countryName}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                  />
                </Box>
              </Stack>
            </ListItemButton>
          </Paper>
        );
      })}
    </List>
  );
}