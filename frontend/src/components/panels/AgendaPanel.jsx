import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
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
import CloseIcon from "@mui/icons-material/Close";

const INITIAL_VISIBLE_MEETINGS = 5;

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatMeetingDate(dateString) {
  const date = parseDate(dateString);

  if (!date) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateKey(dateValue) {
  const date = parseDate(dateValue);

  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(dateValue) {
  const date = parseDate(dateValue);

  if (!date) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function isMeetingStillActive(meeting, currentTime) {
  if (!currentTime) return true;

  const start = parseDate(meeting?.fecha);
  if (!start) return false;

  const end = parseDate(meeting?.fechaFin) || start;
  return end.getTime() >= currentTime;
}

function isUpcomingWithin7Days(meeting, currentTime) {
  if (!currentTime) return false;

  const start = parseDate(meeting?.fecha);
  if (!start) return false;

  const end = parseDate(meeting?.fechaFin) || start;

  const diffMs = start.getTime() - currentTime;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const stillActive = end.getTime() >= currentTime;
  const within7Days = diffMs >= 0 && diffDays <= 7;

  return stillActive && within7Days;
}

export default function AgendaPanel({
  meetings = [],
  onSelectContact,
  onOpenCreateMeeting,
  onEditMeeting,
  onDeleteMeeting,
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDraftDate, setCalendarDraftDate] = useState(new Date());
  const [visibleMeetingsCount, setVisibleMeetingsCount] = useState(
    INITIAL_VISIBLE_MEETINGS,
  );
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(Date.now());
    };

    updateCurrentTime();

    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const todayKey = formatDateKey(new Date());

  const normalizedMeetings = useMemo(() => {
    return meetings
      .map((meeting) => {
        const contact = meeting.contactos;
        const startDate = parseDate(meeting.fecha_inicio);

        return startDate
          ? {
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
              startDate,
              dateKey: formatDateKey(startDate),
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.startDate - b.startDate);
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

  const meetingsByDate = useMemo(() => {
    return filteredMeetings.reduce((acc, meeting) => {
      if (!acc[meeting.dateKey]) {
        acc[meeting.dateKey] = [];
      }

      acc[meeting.dateKey].push(meeting);
      return acc;
    }, {});
  }, [filteredMeetings]);

  const selectedDateKey = formatDateKey(selectedDate);
  const calendarDraftDateKey = formatDateKey(calendarDraftDate);

  const selectedDayMeetings = (meetingsByDate[selectedDateKey] || []).filter(
    (meeting) => isMeetingStillActive(meeting, currentTime),
  );

  const todayMeetings = (meetingsByDate[todayKey] || []).filter((meeting) =>
    isMeetingStillActive(meeting, currentTime),
  );

  const calendarDraftMeetings = (
    meetingsByDate[calendarDraftDateKey] || []
  ).filter((meeting) => isMeetingStillActive(meeting, currentTime));

  const calendarDraftDateLabel = formatShortDate(calendarDraftDate);

  const upcomingCount = filteredMeetings.filter((meeting) =>
    isUpcomingWithin7Days(meeting, currentTime),
  ).length;

  const selectedDateLabel = formatShortDate(selectedDate);

  const visibleMeetings = filteredMeetings.slice(0, visibleMeetingsCount);
  const remainingMeetings = Math.max(
    filteredMeetings.length - visibleMeetings.length,
    0,
  );

  const handleShowMoreMeetings = () => {
    setVisibleMeetingsCount((prev) =>
      Math.min(prev + 10, filteredMeetings.length),
    );
  };

  const handleShowLessMeetings = () => {
    setVisibleMeetingsCount(INITIAL_VISIBLE_MEETINGS);
  };

  const renderMeetingCard = (meeting, compact = false) => {
    const active = isMeetingStillActive(meeting, currentTime);

    return (
      <Card
        key={`${compact ? "mini" : "full"}-${meeting.id}`}
        className={`agenda-meeting-card ${
          active ? "agenda-meeting-card--upcoming" : "agenda-meeting-card--past"
        } ${compact ? "agenda-meeting-card--mini" : ""}`}
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
        <CardContent sx={compact ? { pb: "16px !important" } : undefined}>
          <Stack spacing={compact ? 1.2 : 1.5}>
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
                    fontSize: compact ? "0.92rem" : "0.98rem",
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
                    WebkitLineClamp: compact ? 1 : 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: compact ? "0.8rem" : undefined,
                  }}
                >
                  {meeting.descripcion}
                </Typography>
              </Box>

              <Chip
                size="small"
                label={active ? "Próxima" : "Pasada"}
                color={active ? "primary" : "default"}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              />
            </Stack>

            <Divider />

            <Stack spacing={0.8}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" sx={{ color: "#64748b" }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: compact ? "0.8rem" : undefined }}
                >
                  {formatMeetingDate(meeting.fecha)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <PlaceOutlinedIcon fontSize="small" sx={{ color: "#64748b" }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: compact ? "0.8rem" : undefined }}
                >
                  {meeting.lugar}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineIcon fontSize="small" sx={{ color: "#64748b" }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: compact ? "0.8rem" : undefined }}
                >
                  {meeting.contacto?.nombre || "Sin contacto"} ·{" "}
                  {meeting.contacto?.empresa || "Sin empresa"}
                </Typography>
              </Stack>
            </Stack>

            {!compact ? (
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
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Stack spacing={2.2}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Agenda global
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Reuniones vinculadas a contactos reales.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className="agenda-top-actions"
        >
          <Button
            variant="contained"
            onClick={onOpenCreateMeeting}
            className="agenda-add-btn"
          >
            Agregar reunión
          </Button>

          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={() => {
              setCalendarDraftDate(selectedDate);
              setCalendarOpen(true);
            }}
            className="agenda-calendar-open-btn"
          >
            Ver calendario
          </Button>
        </Stack>

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

              <TextField
                fullWidth
                size="small"
                label="Buscar reunión o contacto"
                placeholder="Ej: Madrid, Ana, comercial..."
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setVisibleMeetingsCount(INITIAL_VISIBLE_MEETINGS);
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {todayMeetings.length > 0 ? (
          <Alert
            severity="info"
            className="agenda-today-alert"
            sx={{
              borderRadius: 3,
            }}
          >
            Hoy tenés {todayMeetings.length} reunión
            {todayMeetings.length === 1 ? "" : "es"} programada
            {todayMeetings.length === 1 ? "" : "s"}.
          </Alert>
        ) : null}

        <Card
          className="agenda-selected-date-card"
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent>
            <Stack spacing={1.2}>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  fontSize: "0.98rem",
                }}
              >
                Vista previa del {selectedDateLabel}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedDayMeetings.length === 0
                  ? "No hay reuniones previstas para este día."
                  : `${selectedDayMeetings.length} reunión${
                      selectedDayMeetings.length === 1 ? "" : "es"
                    } prevista${
                      selectedDayMeetings.length === 1 ? "" : "s"
                    } para esta fecha.`}
              </Typography>

              {selectedDayMeetings.length > 0 ? (
                <Stack spacing={1}>
                  {selectedDayMeetings
                    .slice(0, 2)
                    .map((meeting) => renderMeetingCard(meeting, true))}

                  {selectedDayMeetings.length > 2 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontSize: "0.8rem",
                        textAlign: "center",
                        pt: 0.4,
                      }}
                    >
                      +{selectedDayMeetings.length - 2} reunión
                      {selectedDayMeetings.length - 2 === 1 ? "" : "es"} más en
                      este día
                    </Typography>
                  ) : null}
                </Stack>
              ) : null}
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

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.8 }}
              >
                Cargá reuniones en Supabase o ajustá la búsqueda.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Stack spacing={1.5}>
              {visibleMeetings.map((meeting) => renderMeetingCard(meeting))}
            </Stack>

            {filteredMeetings.length > INITIAL_VISIBLE_MEETINGS ? (
              <Stack spacing={0.8} sx={{ pt: 0.5 }}>
                {visibleMeetingsCount < filteredMeetings.length ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleShowMoreMeetings}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Mostrar más
                    </Button>

                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: "0.86rem",
                      }}
                    >
                      Quedan {remainingMeetings} reunión
                      {remainingMeetings === 1 ? "" : "es"}
                    </Typography>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={handleShowLessMeetings}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Mostrar menos
                  </Button>
                )}
              </Stack>
            ) : null}
          </>
        )}
      </Stack>

      <Dialog
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: "agenda-calendar-dialog-paper",
        }}
      >
        <Box className="agenda-calendar-dialog-header">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <DialogTitle className="agenda-calendar-dialog-title">
                Calendario de reuniones
              </DialogTitle>

              <Typography className="agenda-calendar-dialog-subtitle">
                Elegí un día y te mostramos la vista previa de esa fecha.
              </Typography>
            </Box>

            <IconButton
              onClick={() => setCalendarOpen(false)}
              className="agenda-calendar-dialog-close"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent className="agenda-calendar-dialog-content">
          <Stack spacing={2.2}>
            <Box className="agenda-calendar-wrap">
              <Calendar
                onChange={(value) => {
                  setCalendarDraftDate(value);
                }}
                value={calendarDraftDate}
                locale="es-AR"
                className="agenda-calendar"
                tileClassName={({ date, view }) => {
                  if (view !== "month") return null;

                  const key = formatDateKey(date);
                  const hasMeetings = Boolean(meetingsByDate[key]?.length);
                  const isTodayTile = key === todayKey;
                  const isSelected = key === calendarDraftDateKey;

                  return [
                    hasMeetings ? "agenda-calendar__tile--has-meeting" : "",
                    isTodayTile ? "agenda-calendar__tile--today" : "",
                    isSelected ? "agenda-calendar__tile--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                }}
                tileContent={({ date, view }) => {
                  if (view !== "month") return null;

                  const key = formatDateKey(date);
                  const count = meetingsByDate[key]?.length || 0;

                  if (!count) return null;

                  return (
                    <Box className="agenda-calendar__dot-wrap">
                      <Box className="agenda-calendar__dot" />
                    </Box>
                  );
                }}
              />
            </Box>

            <Card className="agenda-calendar-summary-card">
              <CardContent>
                <Stack spacing={1.2}>
                  <Typography className="agenda-calendar-summary-title">
                    Día seleccionado: {calendarDraftDateLabel}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="agenda-calendar-summary-text"
                  >
                    {calendarDraftMeetings.length === 0
                      ? "No hay reuniones programadas para este día."
                      : `Hay ${calendarDraftMeetings.length} reunión${
                          calendarDraftMeetings.length === 1 ? "" : "es"
                        } programada${
                          calendarDraftMeetings.length === 1 ? "" : "s"
                        } para este día.`}
                  </Typography>

                  {calendarDraftMeetings.length > 0 ? (
                    <Stack spacing={1}>
                      {calendarDraftMeetings.slice(0, 2).map((meeting) => (
                        <Box
                          key={`draft-${meeting.id}`}
                          className="agenda-calendar-mini-item"
                        >
                          <Typography className="agenda-calendar-mini-title">
                            {meeting.titulo}
                          </Typography>

                          <Typography className="agenda-calendar-mini-meta">
                            {formatMeetingDate(meeting.fecha)}
                          </Typography>

                          <Typography className="agenda-calendar-mini-meta">
                            {meeting.contacto?.nombre || "Sin contacto"} ·{" "}
                            {meeting.contacto?.empresa || "Sin empresa"}
                          </Typography>
                        </Box>
                      ))}

                      {calendarDraftMeetings.length > 2 ? (
                        <Typography className="agenda-calendar-mini-more">
                          +{calendarDraftMeetings.length - 2} reunión
                          {calendarDraftMeetings.length - 2 === 1
                            ? ""
                            : "es"}{" "}
                          más
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : null}

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    sx={{ pt: 0.5 }}
                  >
                    <Button
                      variant="contained"
                      className="agenda-calendar-apply-btn"
                      onClick={() => {
                        setSelectedDate(calendarDraftDate);
                        setCalendarOpen(false);
                      }}
                    >
                      Ver reuniones de este día
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
