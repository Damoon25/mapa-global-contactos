import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ResizeMapOnLayoutChange({ trigger }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map, trigger]);

  return null;
}

function FitBoundsToContacts({ contacts, drawerOpen, selectedContact }) {
  const map = useMap();

  useEffect(() => {
    if (selectedContact?.lat != null && selectedContact?.lng != null) return;
    if (!contacts || contacts.length === 0) return;

    const points = contacts
      .filter((contact) => contact?.lat != null && contact?.lng != null)
      .map((contact) => [Number(contact.lat), Number(contact.lng)]);

    if (points.length === 0) return;

    if (points.length === 1) {
      map.flyTo(points[0], 3, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
      return;
    }

    const bounds = L.latLngBounds(points);

    map.flyToBounds(bounds, {
      paddingTopLeft: drawerOpen ? [420, 140] : [100, 140],
      paddingBottomRight: [80, 80],
      maxZoom: 3,
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [contacts, drawerOpen, map, selectedContact]);

  return null;
}

function OpenSelectedMarker({ selectedContact, drawerOpen, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedContact?.id) return;
    if (selectedContact.lat == null || selectedContact.lng == null) return;

    const marker = markerRefs.current[selectedContact.id];
    if (!marker) return;

    const timer = setTimeout(
      () => {
        const latLng = L.latLng(
          Number(selectedContact.lat),
          Number(selectedContact.lng),
        );

        const zoom = 5;

        const point = map.project(latLng, zoom);

        const offsetY = 220; // 🔥 ajustá esto

        const newPoint = L.point(point.x, point.y - offsetY);
        const newLatLng = map.unproject(newPoint, zoom);

        map.flyTo(newLatLng, zoom, {
          animate: true,
          duration: 1.2,
          easeLinearity: 0.25,
        });

        setTimeout(() => {
          marker.openPopup();
        }, 200);
      },
      drawerOpen ? 280 : 140,
    );

    return () => clearTimeout(timer);
  }, [map, selectedContact, drawerOpen, markerRefs]);

  return null;
}

function MarkerPopupContent({
  contact,
  onEdit,
  onDelete,
  onViewMore,
  onClose,
}) {
  const initial = (contact.nombre || "?").charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        width: 260,
        px: 2,
        py: 2,
      }}
    >
      <Stack spacing={2.6}>
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontSize: 18,
              fontWeight: 700,
              bgcolor: "#e5e7eb",
              color: "#6b7280",
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {contact.nombre || "Sin nombre"}
            </Typography>

            <Typography
              sx={{
                mt: 0.45,
                fontSize: 13,
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              {contact.empresa || "Sin empresa"}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            sx={{
              width: 30,
              height: 30,
              mt: -0.3,
              color: "#94a3b8",
              border: "1px solid #e5e7eb",
              bgcolor: "#fff",
              "&:hover": {
                bgcolor: "#f8fafc",
              },
              transition: "all 0.18s ease",
            }}
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
          {contact.paises?.nombre ? (
            <Chip
              size="small"
              label={contact.paises.nombre}
              sx={{
                height: 28,
                borderRadius: "999px",
                bgcolor: "#f3f4f6",
                color: "#374151",
                fontWeight: 500,
              }}
            />
          ) : null}

          {contact.ciudades?.name ? (
            <Chip
              size="small"
              label={contact.ciudades.name}
              sx={{
                height: 28,
                borderRadius: "999px",
                bgcolor: "#f3f4f6",
                color: "#374151",
                fontWeight: 500,
              }}
            />
          ) : null}
        </Stack>

        {contact.telefono ? (
          <Typography
            sx={{
              fontSize: 14,
              color: "#2563eb",
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            {contact.telefono}
          </Typography>
        ) : null}

        <Divider />

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <Tooltip title="Ver más">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onViewMore?.(contact);
              }}
              sx={{
                width: 40,
                height: 40,
                border: "1px solid #bfdbfe",
                color: "#2563eb",
                bgcolor: "#eff6ff",
                "&:hover": {
                  bgcolor: "#dbeafe",
                  transition: "all 0.18s ease",
                },
              }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(contact);
              }}
              sx={{
                width: 40,
                height: 40,
                border: "1px solid #d1d5db",
                color: "#374151",
                bgcolor: "#ffffff",
                "&:hover": {
                  bgcolor: "#f9fafb",
                  transition: "all 0.18s ease",
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(contact);
              }}
              sx={{
                width: 40,
                height: 40,
                border: "1px solid #fecaca",
                color: "#dc2626",
                bgcolor: "#fff5f5",
                "&:hover": {
                  bgcolor: "#fee2e2",
                  transition: "all 0.18s ease",
                },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function MapView({
  contacts = [],
  drawerOpen = false,
  selectedContact = null,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onViewMore,
}) {
  const markerRefs = useRef({});

  const validContacts = useMemo(
    () =>
      contacts.filter(
        (contact) => contact?.lat != null && contact?.lng != null,
      ),
    [contacts],
  );

  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      minZoom={3}
      maxZoom={12}
      maxBounds={[
        [-70, -180],
        [85, 180],
      ]}
      maxBoundsViscosity={1.0}
      worldCopyJump
      zoomControl={false}
      className="leaflet-map"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ResizeMapOnLayoutChange trigger={drawerOpen} />
      <FitBoundsToContacts
        contacts={validContacts}
        drawerOpen={drawerOpen}
        selectedContact={selectedContact}
      />
      <OpenSelectedMarker
        selectedContact={selectedContact}
        drawerOpen={drawerOpen}
        markerRefs={markerRefs}
      />

      {validContacts.map((contact) => (
        <Marker
          key={contact.id}
          position={[Number(contact.lat), Number(contact.lng)]}
          icon={markerIcon}
          ref={(ref) => {
            if (ref) {
              markerRefs.current[contact.id] = ref;
            }
          }}
          eventHandlers={{
            click: () => {
              onSelectContact?.(contact);
            },
          }}
        >
          <Popup className="marker-popup-shell" autoPan closeButton={false}>
            <MarkerPopupContent
              contact={contact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
              onViewMore={onViewMore}
              onClose={() => {
                markerRefs.current[contact.id]?.closePopup();
              }}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
