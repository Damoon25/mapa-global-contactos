import { useEffect, useRef } from "react";
import { Alert, Snackbar } from "@mui/material";

function parseMeetingDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getUpcomingMeetingNotification(meetings = []) {
  const now = new Date();

  const sorted = meetings
    .map((meeting) => {
      const start = parseMeetingDate(meeting.fecha_inicio);
      return start ? { ...meeting, __start: start } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.__start - b.__start);

  for (const meeting of sorted) {
    const diffMs = meeting.__start.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    const isSameDay =
      meeting.__start.getFullYear() === now.getFullYear() &&
      meeting.__start.getMonth() === now.getMonth() &&
      meeting.__start.getDate() === now.getDate();

    if (diffMinutes >= 0 && diffMinutes <= 60) {
      return {
        id: `soon-${meeting.id}`,
        severity: "info",
        message: `En ${
          diffMinutes <= 1
            ? "menos de 1 minuto"
            : `${diffMinutes} minuto${diffMinutes === 1 ? "" : "s"}`
        } empieza "${meeting.titulo}".`,
      };
    }

    if (isSameDay && diffMinutes > 60) {
      return {
        id: `today-${meeting.id}`,
        severity: "warning",
        message: `Hoy tenés programada la reunión "${meeting.titulo}".`,
      };
    }
  }

  return null;
}

export default function UpcomingMeetingNotifier({
  meetings = [],
  enabled = true,
  open,
  onClose,
  notification,
  setNotification,
}) {
  const lastNotifiedIdRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const nextNotification = getUpcomingMeetingNotification(meetings);

    if (!nextNotification) return;

    if (lastNotifiedIdRef.current === nextNotification.id) return;

    lastNotifiedIdRef.current = nextNotification.id;
    setNotification?.(nextNotification);
  }, [enabled, meetings, setNotification]);

  return (
    <Snackbar
      open={open && Boolean(notification)}
      autoHideDuration={6500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={notification?.severity || "info"}
        variant="filled"
        sx={{
          width: "100%",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
          alignItems: "center",
        }}
      >
        {notification?.message || ""}
      </Alert>
    </Snackbar>
  );
}