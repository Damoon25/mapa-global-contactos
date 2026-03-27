import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function FitBoundsToContacts({ contacts, drawerOpen }) {
  const map = useMap();

  useEffect(() => {
    if (!contacts || contacts.length === 0) return;

    const points = contacts
      .filter(
        (contact) =>
          contact?.paises?.lat !== null &&
          contact?.paises?.lat !== undefined &&
          contact?.paises?.lng !== null &&
          contact?.paises?.lng !== undefined
      )
      .map((contact) => [
        Number(contact.paises.lat),
        Number(contact.paises.lng),
      ]);

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
  }, [contacts, drawerOpen, map]);

  return null;
}

function FloatingContactPopup({ contact, onClose }) {
  if (!contact) return null;

  return (
    <div className="floating-popup">
      <button type="button" className="floating-popup-close" onClick={onClose}>
        ×
      </button>

      <div className="floating-popup-card">
        <div className="popup-header">
          <div className="popup-title-group">
            <h3>{contact.nombre}</h3>
            <p>{contact.empresa || "Sin empresa"}</p>
          </div>
        </div>

        <div className="popup-chips">
          {contact.paises?.continente && <span>{contact.paises.continente}</span>}
          {contact.ciudad && <span>{contact.ciudad}</span>}
          {contact.cargo && <span>{contact.cargo}</span>}
        </div>

        <div className="popup-section">
          <strong>Información principal</strong>
          <p><b>País:</b> {contact.paises?.nombre || "-"}</p>
          <p><b>Empresa:</b> {contact.empresa || "-"}</p>
          <p><b>Cargo:</b> {contact.cargo || "-"}</p>
          <p>
            <b>Teléfono:</b>{" "}
            {contact.paises?.codigo_telefono
              ? `${contact.paises.codigo_telefono} `
              : ""}
            {contact.telefono || "-"}
          </p>
          <p><b>Email:</b> {contact.email || "-"}</p>
        </div>

        <div className="popup-section">
          <strong>Empleados asociados</strong>
          {contact.empleados?.length > 0 ? (
            <div className="popup-employees">
              {contact.empleados.map((empleado) => (
                <div key={empleado.id} className="popup-employee-card">
                  <div className="popup-employee-name">{empleado.nombre}</div>
                  <div className="popup-employee-role">
                    {empleado.cargo || "Sin cargo"}
                  </div>
                  {empleado.telefono && <div>{empleado.telefono}</div>}
                  {empleado.email && <div>{empleado.email}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p>No hay empleados cargados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapView({ contacts = [], drawerOpen = false }) {
  const [selectedContact, setSelectedContact] = useState(null);

  const validContacts = contacts.filter((contact) => {
    const lat = contact?.paises?.lat;
    const lng = contact?.paises?.lng;

    return lat !== null && lat !== undefined && lng !== null && lng !== undefined;
  });

  return (
    <>
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
        worldCopyJump={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ResizeMapOnLayoutChange trigger={drawerOpen} />
        <FitBoundsToContacts contacts={validContacts} drawerOpen={drawerOpen} />

        {validContacts.map((contact) => (
          <Marker
            key={contact.id}
            position={[
              Number(contact.paises.lat),
              Number(contact.paises.lng),
            ]}
            eventHandlers={{
              click: () => {
                setSelectedContact(contact);
              },
            }}
          />
        ))}
      </MapContainer>

      <FloatingContactPopup
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </>
  );
}