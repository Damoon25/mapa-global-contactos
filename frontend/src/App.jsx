import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TableViewIcon from "@mui/icons-material/TableView";
import DownloadIcon from "@mui/icons-material/Download";
import PublicIcon from "@mui/icons-material/Public";
import PlaceIcon from "@mui/icons-material/Place";
import CloseIcon from "@mui/icons-material/Close";

import * as XLSX from "xlsx";

import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix iconos de Leaflet en Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const initialContacts = [
  {
    id: 1,
    country: "Argentina",
    continent: "América",
    city: "Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
    contact: "Juan Pérez",
    email: "juan@empresa.com",
    phone: "+54 11 1234 5678",
    company: "PVS Argentina",
    color: "#4caf50",
  },
  {
    id: 2,
    country: "Suiza",
    continent: "Europa",
    city: "Zúrich",
    lat: 47.3769,
    lng: 8.5417,
    contact: "Anna Müller",
    email: "anna@empresa.com",
    phone: "+41 44 555 1234",
    company: "PVS Switzerland",
    color: "#2196f3",
  },
  {
    id: 3,
    country: "España",
    continent: "Europa",
    city: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
    contact: "Carlos Ruiz",
    email: "carlos@empresa.com",
    phone: "+34 91 555 0000",
    company: "PVS Spain",
    color: "#ff9800",
  },
];

const continentColors = {
  Todos: "#546e7a",
  América: "#2e7d32",
  Europa: "#1565c0",
  Asia: "#6a1b9a",
  África: "#ef6c00",
  Oceanía: "#00838f",
};

const worldBounds = [
  [-60, -180],
  [85, 180],
];

function FlyToMarker({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 4, {
        duration: 1.2,
      });
    }
  }, [selected, map]);

  return null;
}

function MapController({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("Todos");
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedCountry, setSelectedCountry] = useState(
    initialContacts[0] || null,
  );

  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([20, 0], 2, {
        duration: 1.2,
      });
    }
  };

  const openSelectedCountry = () => {
    if (selectedCountry) {
      setDrawerOpen(true);
    }
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((item) => {
      const matchesContinent =
        selectedContinent === "Todos" || item.continent === selectedContinent;

      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.country.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.contact.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.continent.toLowerCase().includes(q);

      return matchesContinent && matchesSearch;
    });
  }, [contacts, search, selectedContinent]);

  const handleMarkerClick = (item) => {
    setSelectedCountry(item);
    setDrawerOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const normalizeRow = (row, index) => {
    const country = row.country || row.Country || row.pais || row.Pais || "";
    const continent =
      row.continent ||
      row.Continent ||
      row.continente ||
      row.Continente ||
      "Sin definir";
    const city = row.city || row.City || row.ciudad || row.Ciudad || "";
    const contact =
      row.contact || row.Contact || row.contacto || row.Contacto || "";
    const email = row.email || row.Email || "";
    const phone = row.phone || row.Phone || row.telefono || row.Telefono || "";
    const company =
      row.company || row.Company || row.empresa || row.Empresa || "";
    const lat = parseFloat(row.lat || row.Lat || row.latitude || row.Latitude);
    const lng = parseFloat(
      row.lng || row.Lng || row.longitude || row.Longitude,
    );

    if (!country || Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return {
      id: Date.now() + index,
      country,
      continent,
      city,
      lat,
      lng,
      contact,
      email,
      phone,
      company,
      color: continentColors[continent] || "#607d8b",
    };
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    try {
      if (extension === "csv") {
        const text = await file.text();
        const workbook = XLSX.read(text, { type: "string" });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const parsed = rows.map(normalizeRow).filter(Boolean);

        if (parsed.length > 0) {
          setContacts(parsed);
          setSelectedCountry(parsed[0]);
        }
      } else if (extension === "xlsx" || extension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const parsed = rows.map(normalizeRow).filter(Boolean);

        if (parsed.length > 0) {
          setContacts(parsed);
          setSelectedCountry(parsed[0]);
        }
      } else {
        alert("Formato no soportado. Usá CSV o Excel.");
      }
    } catch (error) {
      console.error("Error importando archivo:", error);
      alert("No se pudo importar el archivo.");
    }

    event.target.value = "";
  };

  const exportToCSV = () => {
    const exportData = contacts.map((item) => ({
      country: item.country,
      continent: item.continent,
      city: item.city,
      lat: item.lat,
      lng: item.lng,
      contact: item.contact,
      email: item.email,
      phone: item.phone,
      company: item.company,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contactos_mapa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const exportData = contacts.map((item) => ({
      country: item.country,
      continent: item.continent,
      city: item.city,
      lat: item.lat,
      lng: item.lng,
      contact: item.contact,
      email: item.email,
      phone: item.phone,
      company: item.company,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contactos");
    XLSX.writeFile(workbook, "contactos_mapa.xlsx");
  };

  const visibleContinents = [
    "Todos",
    "América",
    "Europa",
    "Asia",
    "África",
    "Oceanía",
  ];

  return (
    <Box className="app-root">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        hidden
        onChange={handleFileChange}
      />

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        maxBounds={worldBounds}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        className="map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController mapRef={mapRef} />

        {filteredContacts.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(item),
            }}
          />
        ))}

        <FlyToMarker selected={selectedCountry} />
      </MapContainer>

      {!drawerOpen && (
        <Box className="mini-sidebar">
          <IconButton
            onClick={() => setDrawerOpen(true)}
            aria-label="abrir panel"
          >
            <MenuIcon />
          </IconButton>

          <Divider sx={{ my: 1, width: "100%" }} />

          <IconButton onClick={resetMapView} aria-label="restablecer vista">
            <PublicIcon />
          </IconButton>

          <IconButton
            onClick={openSelectedCountry}
            aria-label="abrir país seleccionado"
          >
            <PlaceIcon />
          </IconButton>

          <IconButton onClick={focusSearch} aria-label="enfocar búsqueda">
            <SearchIcon />
          </IconButton>
        </Box>
      )}

      <AppBar position="fixed" elevation={0} className="topbar">
        <Toolbar className="topbar-toolbar">
          <Paper className="topbar-panel" elevation={6}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              className="topbar-content"
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                flexShrink={0}
              >
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  className="menu-btn topbar-menu-btn"
                  aria-label="abrir panel"
                >
                  <MenuIcon />
                </IconButton>
              </Stack>

              <Paper className="search-box" elevation={0}>
                <SearchIcon className="search-icon" />
                <TextField
                  inputRef={searchInputRef}
                  variant="standard"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                />
              </Paper>

              <Stack
                direction="row"
                spacing={1}
                className="continent-scroll"
                alignItems="center"
              >
                {visibleContinents.map((continent) => (
                  <Chip
                    key={continent}
                    label={continent}
                    clickable
                    onClick={() => setSelectedContinent(continent)}
                    className={
                      selectedContinent === continent
                        ? "continent-chip active"
                        : "continent-chip"
                    }
                    sx={{
                      backgroundColor: continentColors[continent],
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent="flex-end"
                className="actions-wrap"
              >
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  onClick={handleImportClick}
                  className="action-btn import-btn"
                >
                  Importar CSV
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<TableViewIcon />}
                  onClick={exportToExcel}
                  className="action-btn"
                >
                  Excel
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                  className="action-btn"
                >
                  Exportar
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          className: "drawer-paper",
        }}
        variant="temporary"
      >
        <Box className="drawer-header">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar className="drawer-avatar">
                <PublicIcon />
              </Avatar>

              <Box>
                <Typography variant="h6" className="drawer-title">
                  Detalle del país
                </Typography>
                <Typography variant="body2" className="drawer-subtitle">
                  Click en un marker para actualizar el panel
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        <Box className="drawer-body">
          {selectedCountry ? (
            <>
              <Typography variant="h5" className="country-title">
                {selectedCountry.country}
              </Typography>

              <Stack direction="row" spacing={1} className="country-meta">
                <Chip
                  label={selectedCountry.continent}
                  size="small"
                  sx={{
                    backgroundColor:
                      continentColors[selectedCountry.continent] || "#607d8b",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={selectedCountry.city || "Sin ciudad"}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <List dense className="info-list">
                <ListItem disablePadding>
                  <ListItemText
                    primary="Empresa"
                    secondary={selectedCountry.company || "No definida"}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemText
                    primary="Contacto"
                    secondary={selectedCountry.contact || "No definido"}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemText
                    primary="Email"
                    secondary={selectedCountry.email || "No definido"}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemText
                    primary="Teléfono"
                    secondary={selectedCountry.phone || "No definido"}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemText
                    primary="Coordenadas"
                    secondary={`${selectedCountry.lat}, ${selectedCountry.lng}`}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" className="section-title">
                Países visibles
              </Typography>

              <Stack spacing={1.2} className="country-list">
                {filteredContacts.map((item) => (
                  <Paper
                    key={item.id}
                    className={
                      selectedCountry.id === item.id
                        ? "country-card selected"
                        : "country-card"
                    }
                    onClick={() => setSelectedCountry(item)}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <PlaceIcon
                        sx={{
                          color: continentColors[item.continent] || "#607d8b",
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          className="country-card-title"
                        >
                          {item.country}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="country-card-subtitle"
                        >
                          {item.city} · {item.contact || "Sin contacto"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </>
          ) : (
            <Typography variant="body1">No hay país seleccionado.</Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

export default App;