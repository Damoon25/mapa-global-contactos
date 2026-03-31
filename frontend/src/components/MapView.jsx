import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
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
      map.setView(points[0], 4, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      paddingTopLeft: drawerOpen ? [420, 140] : [100, 140],
      paddingBottomRight: [80, 80],
      maxZoom: 4,
      animate: true,
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
        map.setView(
          [Number(selectedContact.lat), Number(selectedContact.lng)],
          5,
          { animate: true },
        );

        marker.openPopup();
        map.invalidateSize();
      },
      drawerOpen ? 250 : 100,
    );

    return () => clearTimeout(timer);
  }, [map, selectedContact, drawerOpen, markerRefs]);

  return null;
}

function MarkerPopupContent({ contact, onEdit, onDelete, onViewMore }) {
  return (
    <div className="marker-popup-compact">
      <div className="mp-title">
        <strong>{contact.nombre || "Sin nombre"}</strong>
        <span>{contact.empresa || "-"}</span>
      </div>

      <div className="mp-meta">
        <span>{contact.paises?.nombre || "-"}</span>
        {contact.ciudades?.name && <span>· {contact.ciudades.name}</span>}
      </div>

      {contact.telefono && <div className="mp-phone">{contact.telefono}</div>}

      <div className="mp-actions">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewMore?.(contact);
          }}
        >
          Ver más
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(contact);
          }}
        >
          ✎
        </button>

        <button
          type="button"
          className="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(contact);
          }}
        >
          🗑
        </button>
      </div>
    </div>
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
      center={[15, -35]}
      zoom={3}
      minZoom={3}
      maxZoom={10}
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
          <Popup className="marker-popup-shell" autoPan closeButton>
            <MarkerPopupContent
              contact={contact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
              onViewMore={onViewMore}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
