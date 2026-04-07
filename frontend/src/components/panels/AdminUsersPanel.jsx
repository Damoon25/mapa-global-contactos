import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

export default function AdminUsersPanel({
  users = [],
  loading = false,
  savingUserId = null,
  currentUserId = null,
  onApproveUser,
  onToggleActive,
  onChangeRole,
}) {
  const pendingUsers = users.filter((user) => !user.activo);
  const activeUsers = users.filter((user) => user.activo);

  const renderUserCard = (user) => {
    const isSaving = savingUserId === user.id;
    const isCurrentUser = currentUserId && user.user_id === currentUserId;

    const accessLabel =
      user.tipo_mapa === "argentina"
        ? "Argentina"
        : user.tipo_mapa === "publico"
          ? "Público"
          : "Global";

    const roleLabel =
      user.rol === "admin"
        ? "Admin"
        : user.rol === "viewer"
          ? "Viewer"
          : "Viewer";

    return (
      <Card
        key={user.id}
        sx={{
          borderRadius: "16px",
          border: "1px solid rgba(226, 232, 240, 0.95)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 8px 18px rgba(15,23,42,0.05)",
        }}
      >
        <CardContent sx={{ p: 1.6, "&:last-child": { pb: 1.6 } }}>
          <Stack spacing={1.3}>
            <Stack spacing={0.8}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    lineHeight: 1.2,
                    color: "#0f172a",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {user.activo ? "Usuario activo" : "Usuario pendiente"}
                </Typography>

                <Chip
                  size="small"
                  label={user.activo ? "Activo" : "Pendiente"}
                  color={user.activo ? "success" : "warning"}
                  sx={{
                    height: 26,
                    fontWeight: 700,
                    flexShrink: 0,
                    "& .MuiChip-label": {
                      px: 1.1,
                      fontSize: "0.72rem",
                    },
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  lineHeight: 1.35,
                  color: "#1e293b",
                  wordBreak: "break-word",
                }}
              >
                {user.email}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<MarkEmailReadRoundedIcon />}
                size="small"
                label={`Acceso: ${accessLabel}`}
                sx={{
                  height: 28,
                  bgcolor: "rgba(37, 99, 235, 0.08)",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  "& .MuiChip-label": {
                    fontSize: "0.72rem",
                  },
                }}
              />

              <Chip
                icon={<PersonOutlineRoundedIcon />}
                size="small"
                label={`Perfil: ${roleLabel}`}
                sx={{
                  height: 28,
                  bgcolor: "rgba(15, 23, 42, 0.06)",
                  color: "#334155",
                  fontWeight: 700,
                  "& .MuiChip-label": {
                    fontSize: "0.72rem",
                  },
                }}
              />
            </Stack>

            {!user.activo ? (
              <Button
                variant="contained"
                onClick={() => onApproveUser?.(user)}
                disabled={isSaving}
                sx={{
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1,
                  fontSize: "0.86rem",
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  boxShadow: "0 10px 22px rgba(22,163,74,0.18)",
                }}
              >
                {isSaving ? "Aprobando..." : "Aprobar usuario"}
              </Button>
            ) : null}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: "14px",
                  border: "1px solid rgba(226,232,240,0.95)",
                  background: "#f8fafc",
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "#64748b",
                    fontWeight: 700,
                    mb: 0.6,
                  }}
                >
                  Rol
                </Typography>

                <Select
                  size="small"
                  fullWidth
                  value={user.rol || "viewer"}
                  disabled={isSaving}
                  onChange={(e) => onChangeRole?.(user, e.target.value)}
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "#fff",
                    fontSize: "0.84rem",
                    "& .MuiSelect-select": {
                      py: 0.8,
                    },
                  }}
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </Box>

              <Box
                sx={{
                  p: 1,
                  borderRadius: "14px",
                  border: "1px solid rgba(226,232,240,0.95)",
                  background: "#f8fafc",
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "#64748b",
                    fontWeight: 700,
                    mb: 0.6,
                  }}
                >
                  Estado
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.7}>
                  <Switch
                    checked={Boolean(user.activo)}
                    disabled={isSaving || isCurrentUser}
                    onChange={() => onToggleActive?.(user)}
                    size="small"
                  />
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: user.activo ? "#15803d" : "#b45309",
                    }}
                  >
                    {user.activo ? "Activo" : "Pendiente"}
                  </Typography>
                </Stack>

                {isCurrentUser ? (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "0.68rem",
                      color: "#94a3b8",
                      lineHeight: 1.35,
                    }}
                  >
                    No podés cambiar tu propio estado.
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Stack
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        sx={{ py: 5 }}
      >
        <CircularProgress size={28} sx={{ color: "#2563eb" }} />
        <Typography
          sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.9rem" }}
        >
          Cargando usuarios...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.8}>
      <Stack spacing={0.6}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AdminPanelSettingsRoundedIcon
            sx={{ color: "#2563eb", fontSize: 22 }}
          />
          <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>
            Administración de usuarios
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.82rem" }}
        >
          Aprobá accesos y controlá permisos sin salir de la app.
        </Typography>
      </Stack>

      {pendingUsers.length > 0 ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: "14px",
            boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
            "& .MuiAlert-message": {
              fontSize: "0.82rem",
            },
          }}
        >
          Hay <strong>{pendingUsers.length}</strong> usuario
          {pendingUsers.length === 1 ? "" : "s"} pendiente
          {pendingUsers.length === 1 ? "" : "s"} de aprobación.
        </Alert>
      ) : null}

      <Box>
        <Typography
          sx={{
            mb: 1,
            fontWeight: 800,
            color: "#1e293b",
            fontSize: "0.95rem",
          }}
        >
          Pendientes ({pendingUsers.length})
        </Typography>

        <Stack spacing={1}>
          {pendingUsers.length > 0 ? (
            pendingUsers.map(renderUserCard)
          ) : (
            <Box
              sx={{
                p: 1.6,
                borderRadius: "14px",
                border: "1px dashed rgba(203,213,225,0.95)",
                bgcolor: "rgba(255,255,255,0.8)",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.82rem" }}
              >
                No hay usuarios pendientes.
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Box>
        <Typography
          sx={{
            mb: 1,
            fontWeight: 800,
            color: "#1e293b",
            fontSize: "0.95rem",
          }}
        >
          Activos ({activeUsers.length})
        </Typography>

        <Stack spacing={1}>
          {activeUsers.length > 0 ? (
            activeUsers.map(renderUserCard)
          ) : (
            <Box
              sx={{
                p: 1.6,
                borderRadius: "14px",
                border: "1px dashed rgba(203,213,225,0.95)",
                bgcolor: "rgba(255,255,255,0.8)",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.82rem" }}
              >
                No hay usuarios activos.
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
