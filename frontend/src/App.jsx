import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import './App.css'

function App() {
  return (
    <div className="app-container">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={6}
          maxBounds={[
            [-85, -180],
            [85, 180]
          ]}
          maxBoundsViscosity={1.0}
          className="map-fullscreen"
        >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[-34.6037, -58.3816]}>
          <Popup>Argentina 🇦🇷</Popup>
        </Marker>

        <Marker position={[46.8182, 8.2275]}>
          <Popup>Suiza 🇨🇭</Popup>
        </Marker>

        <Marker position={[40.4168, -3.7038]}>
          <Popup>España 🇪🇸</Popup>
        </Marker>
      </MapContainer>

      <div className="right-panel">
        <div className="search-box">
          <input type="text" placeholder="Buscar país o contacto..." />
        </div>

        <div className="legend-section">
          <h3>Continentes</h3>

          <div className="legend-item">
            <span className="dot america"></span>
            <span>América</span>
          </div>

          <div className="legend-item">
            <span className="dot europe"></span>
            <span>Europa</span>
          </div>

          <div className="legend-item">
            <span className="dot asia"></span>
            <span>Asia</span>
          </div>

          <div className="legend-item">
            <span className="dot africa"></span>
            <span>África</span>
          </div>

          <div className="legend-item">
            <span className="dot oceania"></span>
            <span>Oceanía</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;