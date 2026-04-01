import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";

function formatMeetingDate(dateString) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isUpcoming(dateString) {
  return new Date(dateString) >= new Date();
}

export default function AgendaPanel({
  meetings = [],
  onSelectContact,
  onOpenCreateMeeting,
  onEditMeeting,
  onDeleteMeeting,
}) {
  const [searchText, setSearchText] = useState("");

  const normalizedMeetings = useMemo(() => {
    return meetings
      .map((meeting) => {
        const contact = meeting.contactos;

        return {
          id: meeting.id,
          contacto_id: meeting.contacto_id,
          titulo: meeting.titulo || "Sin título",
          fecha: meeting.fecha_inicio,
          fechaFin: meeting.fecha_fin,
          lugar:
            meeting.lugar ||
            contact?.ciudades?.name ||
            contact?.provincias?.nombre ||
            contact?.paises?.nombre ||
            "Ubicación pendiente",
          descripcion: meeting.descripcion || "Sin descripción",
          estado: meeting.estado || "programada",
          contacto: contact || null,
          raw: meeting,
        };
      })
      .filter((meeting) => meeting.fecha);
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return normalizedMeetings.filter((meeting) => {
      if (!text) return true;

      return (
        meeting.titulo.toLowerCase().includes(text) ||
        meeting.lugar.toLowerCase().includes(text) ||
        meeting.descripcion.toLowerCase().includes(text) ||
        meeting.estado.toLowerCase().includes(text) ||
        meeting.contacto?.nombre?.toLowerCase().includes(text) ||
        meeting.contacto?.empresa?.toLowerCase().includes(text) ||
        meeting.contacto?.paises?.nombre?.toLowerCase().includes(text)
      );
    });
  }, [normalizedMeetings, searchText]);

  const upcomingCount = filteredMeetings.filter((meeting) =>
    isUpcoming(meeting.fecha),
  ).length;

  return (
    <Stack spacing={2.2}>
      <Box>
        <Typography variant="h6" fontWeight={800}>
          Agenda global
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Reuniones vinculadas a contactos reales.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                icon={<CalendarMonthIcon />}
                label={`${filteredMeetings.length} reuniones`}
                sx={{ borderRadius: 999 }}
              />

              <Chip
                icon={<AccessTimeIcon />}
                label={`${upcomingCount} próximas`}
                sx={{ borderRadius: 999 }}
              />
            </Stack>

            <Button
              variant="contained"
              onClick={onOpenCreateMeeting}
              className="agenda-add-btn"
            >
              Agregar reunión
            </Button>

            <TextField
              fullWidth
              size="small"
              label="Buscar reunión o contacto"
              placeholder="Ej: Madrid, Ana, comercial..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </Stack>
        </CardContent>
      </Card>

      {filteredMeetings.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent>
            <Typography fontWeight={700}>
              No hay reuniones para mostrar
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              Cargá reuniones en Supabase y van a aparecer acá automáticamente.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {filteredMeetings.map((meeting) => (
            <Card
              key={meeting.id}
              className={`agenda-meeting-card ${
                isUpcoming(meeting.fecha)
                  ? "agenda-meeting-card--upcoming"
                  : "agenda-meeting-card--past"
              }`}
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.10)",
                },
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        fontWeight={800}
                        sx={{
                          lineHeight: 1.2,
                          color: "#0f172a",
                          fontSize: "0.98rem",
                        }}
                      >
                        {meeting.titulo}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.55,
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {meeting.descripcion}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={isUpcoming(meeting.fecha) ? "Próxima" : "Pasada"}
                      color={isUpcoming(meeting.fecha) ? "primary" : "default"}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    />
                  </Stack>

                  <Divider />

                  <Stack spacing={0.95}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                      <Typography variant="body2">
                        {formatMeetingDate(meeting.fecha)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PlaceOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                      <Typography variant="body2">{meeting.lugar}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonOutlineIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                      <Typography variant="body2">
                        {meeting.contacto?.nombre || "Sin contacto"} ·{" "}
                        {meeting.contacto?.empresa || "Sin empresa"}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                    gap={1}
                  >
                    <Box>
                      {meeting.contacto?.id ? (
                        <Button
                          variant="outlined"
                          size="small"
                          className="agenda-map-btn"
                          startIcon={<FmdGoodOutlinedIcon />}
                          onClick={() => onSelectContact?.(meeting.contacto)}
                        >
                          Ver contacto en mapa
                        </Button>
                      ) : null}
                    </Box>

                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Tooltip title="Editar reunión">
                        <IconButton
                          className="agenda-icon-btn"
                          onClick={() => onEditMeeting?.(meeting.raw)}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar reunión">
                        <IconButton
                          className="agenda-icon-btn agenda-icon-btn--danger"
                          onClick={() => onDeleteMeeting?.(meeting.raw)}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
