import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";

import { getContacts } from "../api/contactsApi";
import MapView from "../components/MapView";
import AddContactDialog from "../components/AddContactDialog";

const CONTINENTES = ["Todos", "América", "Europa", "Asia", "África", "Oceanía"];

export default function HomePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("Todos");
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);

      if (data.length > 0) {
        setSelectedContact(data[0]);
      }
      setDrawerOpen(false);
    } catch (error) {
      console.error("Error al cargar contactos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const text = searchText.trim().toLowerCase();

      const matchesSearch =
        !text ||
        contact.nombre?.toLowerCase().includes(text) ||
        contact.cargo?.toLowerCase().includes(text) ||
        contact.empresa?.toLowerCase().includes(text) ||
        contact.ciudad?.toLowerCase().includes(text) ||
        contact.paises?.nombre?.toLowerCase().includes(text) ||
        contact.paises?.continente?.toLowerCase().includes(text);

      const matchesContinent =
        selectedContinent === "Todos" ||
        contact.paises?.continente === selectedContinent;

      return matchesSearch && matchesContinent;
    });
  }, [contacts, searchText, selectedContinent]);

  useEffect(() => {
    if (!selectedContact && filteredContacts.length > 0) {
      setSelectedContact(filteredContacts[0]);
      return;
    }

    if (
      selectedContact &&
      !filteredContacts.some((contact) => contact.id === selectedContact.id)
    ) {
      setSelectedContact(filteredContacts[0] || null);
    }
  }, [filteredContacts, selectedContact]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPosition(null);
  };

  const handleCreateContact = async (formData) => {
    console.log("Formulario recibido:", formData);
    console.log("Posición seleccionada:", selectedPosition);
    handleCloseDialog();
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleImport = () => {
    console.log("Importar archivo");
  };

  const handleExport = () => {
    console.log("Exportar archivo");
  };

  return (
    <Box className="app-root">
      <Box className="mini-sidebar">
        <IconButton onClick={() => setDrawerOpen((prev) => !prev)}>
          <MenuIcon />
        </IconButton>
      </Box>

      <AppBar position="absolute" className="topbar">
        <Toolbar className="topbar-toolbar">
          <Box className="topbar-panel">
            <Stack spacing={1.5} className="topbar-content">
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                flexWrap="wrap"
              >
                <IconButton
                  className="menu-btn topbar-menu-btn"
                  onClick={() => setDrawerOpen((prev) => !prev)}
                >
                  <MenuIcon />
                </IconButton>

                <Box className="search-box">
                  <SearchIcon className="search-icon" />
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Buscar por país, nombre, empresa, cargo o ciudad"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{ disableUnderline: true }}
                  />
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  className="actions-wrap"
                  flexWrap="wrap"
                >
                  <Button
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    className="action-btn import-btn"
                    onClick={handleImport}
                  >
                    Importar
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    className="action-btn"
                    onClick={handleExport}
                  >
                    Exportar
                  </Button>
                </Stack>
              </Stack>

              <Box className="continent-scroll">
                <Stack direction="row" spacing={1}>
                  {CONTINENTES.map((continent) => (
                    <Chip
                      key={continent}
                      label={continent}
                      clickable
                      className={`continent-chip ${
                        selectedContinent === continent ? "active" : ""
                      }`}
                      color={
                        selectedContinent === continent ? "primary" : "default"
                      }
                      onClick={() => setSelectedContinent(continent)}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ className: "drawer-paper" }}
      >
        <Box className="drawer-header">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar className="drawer-avatar">
                <PlaceIcon />
              </Avatar>
              <Box>
                <Typography className="drawer-title">
                  {selectedContact?.paises?.nombre || "Mapa de contactos"}
                </Typography>
                <Typography variant="body2" className="drawer-subtitle">
                  {selectedContact?.empresa || "Directorio internacional"}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box className="drawer-body">
          {selectedContact ? (
            <>
              <Typography className="country-title">
                {selectedContact.nombre}
              </Typography>

              <Stack direction="row" spacing={1} className="country-meta">
                {selectedContact.paises?.continente && (
                  <Chip label={selectedContact.paises.continente} />
                )}
                {selectedContact.ciudad && (
                  <Chip label={selectedContact.ciudad} />
                )}
                {selectedContact.cargo && (
                  <Chip label={selectedContact.cargo} />
                )}
              </Stack>

              <Typography className="section-title">
                Información principal
              </Typography>

              <Stack spacing={1.2} className="info-list" mb={3}>
                <Typography>
                  <strong>País:</strong> {selectedContact.paises?.nombre || "-"}
                </Typography>
                <Typography>
                  <strong>Empresa:</strong> {selectedContact.empresa || "-"}
                </Typography>
                <Typography>
                  <strong>Cargo:</strong> {selectedContact.cargo || "-"}
                </Typography>
                <Typography>
                  <strong>Teléfono:</strong>{" "}
                  {selectedContact.paises?.codigo_telefono
                    ? `${selectedContact.paises.codigo_telefono} `
                    : ""}
                  {selectedContact.telefono || "-"}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {selectedContact.email || "-"}
                </Typography>
              </Stack>

              <Typography className="section-title">
                Empleados asociados
              </Typography>

              <Stack spacing={1.2} mb={3}>
                {selectedContact.empleados?.length > 0 ? (
                  selectedContact.empleados.map((empleado) => (
                    <Card key={empleado.id} className="country-card">
                      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                        <Typography className="country-card-title">
                          {empleado.nombre}
                        </Typography>
                        <Typography className="country-card-subtitle">
                          {empleado.cargo || "Sin cargo"}
                        </Typography>
                        {empleado.telefono && (
                          <Typography variant="body2">
                            {empleado.telefono}
                          </Typography>
                        )}
                        {empleado.email && (
                          <Typography variant="body2">
                            {empleado.email}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay empleados cargados.
                  </Typography>
                )}
              </Stack>

              <Typography className="section-title">
                Contactos encontrados
              </Typography>

              <Stack spacing={1.2} className="country-list">
                {filteredContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`country-card ${
                      selectedContact?.id === contact.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                      <Typography className="country-card-title">
                        {contact.nombre}
                      </Typography>
                      <Typography className="country-card-subtitle">
                        {contact.paises?.nombre || "-"} ·{" "}
                        {contact.empresa || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {!loading && filteredContacts.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron contactos con esos filtros.
                  </Typography>
                )}
              </Stack>
            </>
          ) : (
            <Stack spacing={2}>
              <Typography className="section-title">Sin selección</Typography>
              <Typography variant="body2" color="text.secondary">
                Elegí un contacto desde la lista o filtrá resultados desde la
                barra superior.
              </Typography>
            </Stack>
          )}
        </Box>
      </Drawer>

      <Box className="map-container">
        <MapView
          contacts={filteredContacts}
          drawerOpen={drawerOpen}
        />
      </Box>

      <AddContactDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleCreateContact}
        selectedPosition={selectedPosition}
      />
    </Box>
  );
}
