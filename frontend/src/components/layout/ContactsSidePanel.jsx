import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

export default function ContactsSidePanel({
  mode = "actions",
  contacts = [],
  selectedContactId = null,
  onOpenCreate,
  onShowList,
  onSelectContact,
  onEditContact,
  onDeleteContact,
}) {
  return (
    <Box
      sx={{
        width: { xs: "100%", md: 380 },
        height: "100%",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(18px)",
        borderRight: { md: "1px solid rgba(148,163,184,0.16)" },
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.93))",
          color: "#fff",
          boxShadow: "0 20px 45px rgba(15,23,42,0.18)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.14)" }}>
            <PublicRoundedIcon />
          </Avatar>

          <Box>
            <Typography fontWeight={800}>Mapa Global de Contactos</Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Gestión simple, visual y sin menús inútiles.
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1.25}>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenCreate}
            sx={{
              borderRadius: 999,
              justifyContent: "flex-start",
              py: 1.2,
              bgcolor: "#2563eb",
            }}
          >
            Agregar contacto
          </Button>

          <Button
            variant={mode === "list" ? "contained" : "outlined"}
            startIcon={<FormatListBulletedRoundedIcon />}
            onClick={onShowList}
            sx={{
              borderRadius: 999,
              justifyContent: "flex-start",
              py: 1.2,
              color: mode === "list" ? "#fff" : "#e2e8f0",
              borderColor: "rgba(255,255,255,0.20)",
            }}
          >
            Listar contactos
          </Button>
        </Stack>
      </Box>

      {mode === "list" && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            border: "1px solid rgba(148,163,184,0.14)",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={800}>Contactos</Typography>
            <Typography variant="body2" color="text.secondary">
              Tocá uno para centrar el marker y abrir su popup.
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List disablePadding>
              {contacts.map((contact) => {
                const isSelected = selectedContactId === contact.id;

                return (
                  <ListItemButton
                    key={contact.id}
                    selected={isSelected}
                    onClick={() => onSelectContact(contact)}
                    sx={{
                      alignItems: "flex-start",
                      px: 2,
                      py: 1.5,
                      borderBottom: "1px solid rgba(148,163,184,0.10)",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ListItemText
                        primary={
                          <Typography fontWeight={700} noWrap>
                            {contact.nombre}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {contact.cargo || "Sin cargo"} ·{" "}
                              {contact.empresa || "Sin empresa"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {contact.paises?.nombre || "Sin país"}
                              {contact.ciudad ? ` · ${contact.ciudad}` : ""}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>

                    <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact);
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContact(contact);
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItemButton>
                );
              })}

              {contacts.length === 0 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay contactos cargados todavía.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Box>
      )}
    </Box>
  );
}
