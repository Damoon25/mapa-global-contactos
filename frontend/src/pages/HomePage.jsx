import { useCallback, useEffect, useMemo, useState } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";

import { getContacts } from "../api/contactsApi";
import MapView from "../components/MapView";
import AddContactDialog from "../components/AddContactDialog";
import useSession from "../hooks/useSession";
import useProfile from "../hooks/useProfile";
import UserMenu from "../components/auth/UserMenu";

const CONTINENTES = ["Todos", "América", "Europa", "Asia", "África", "Oceanía"];

export default function HomePage() {
  const { session, loadingSession } = useSession();
  const { profile, loadingProfile } = useProfile(session?.user);

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("Todos");
  const [selectedContact, setSelectedContact] = useState(null);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);

      const mapType = profile?.tipo_mapa || "global";
      const data = await getContacts({
        userId: session?.user?.id,
        mapType,
      });

      setContacts(data);

      if (data.length > 0) {
        setSelectedContact(data[0]);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.tipo_mapa, session?.user?.id]);

  useEffect(() => {
    if (!loadingSession && !loadingProfile && session?.user) {
      loadContacts();
    }
  }, [loadContacts, loadingSession, loadingProfile, session]);

  const filteredContacts = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return contacts.filter((contact) => {
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

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPosition(null);
  };

  const handleCreateContact = async (formData) => {
    console.log("Received form data:", formData);
    console.log("Selected position:", selectedPosition);
    handleCloseDialog();
  };

  const handleImport = () => {
    console.log("Import file");
  };

  const handleExport = () => {
    console.log("Export file");
  };

  const renderContactDetails = () => {
    if (!selectedContact) {
      return (
        <Stack spacing={2}>
          <Typography className="section-title">Sin selección</Typography>
          <Typography variant="body2" color="text.secondary">
            Elegí un contacto desde la lista o filtrá resultados desde la barra
            superior.
          </Typography>
        </Stack>
      );
    }

    return (
      <>
        <Typography className="country-title">
          {selectedContact.nombre}
        </Typography>

        <Stack direction="row" spacing={1} className="country-meta">
          {selectedContact.paises?.continente && (
            <Chip label={selectedContact.paises.continente} />
          )}
          {selectedContact.ciudad && <Chip label={selectedContact.ciudad} />}
          {selectedContact.cargo && <Chip label={selectedContact.cargo} />}
        </Stack>

        <Typography className="section-title">Información principal</Typography>

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

        <Typography className="section-title">Empleados asociados</Typography>

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
                    <Typography variant="body2">{empleado.telefono}</Typography>
                  )}

                  {empleado.email && (
                    <Typography variant="body2">{empleado.email}</Typography>
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

        <Typography className="section-title">Contactos encontrados</Typography>

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
                  {contact.paises?.nombre || "-"} · {contact.empresa || "-"}
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
    );
  };

  if (loadingSession || loadingProfile) {
    return <p style={{ padding: "24px" }}>Cargando sesión...</p>;
  }

  return (
    <Box className="app-root">
      <Box className="mini-sidebar">
        <IconButton onClick={toggleDrawer}>
          <MenuIcon />
        </IconButton>
      </Box>

      <AppBar position="absolute" className="topbar">
        <Toolbar className="topbar-toolbar">
          <Box className="topbar-panel">
            <Box className="topbar-layout">
              <Box className="topbar-left">
                <Box className="topbar-search-row">
                  <IconButton
                    className="menu-btn topbar-menu-btn"
                    onClick={toggleDrawer}
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
                </Box>

                <Box className="continent-scroll">
                  <Stack direction="row" spacing={1}>
                    {CONTINENTES.map((continent) => (
                      <Chip
                        key={continent}
                        label={continent}
                        clickable
                        data-continent={continent}
                        className={`continent-chip continent-chip--${continent
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/\s+/g, "-")} ${
                          selectedContinent === continent ? "active" : ""
                        }`}
                        onClick={() => setSelectedContinent(continent)}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>

              <Box className="topbar-right">
                <Stack
                  direction="row"
                  spacing={1}
                  className="actions-wrap"
                  alignItems="center"
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

                  <UserMenu user={session?.user} profile={profile} />
                </Stack>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
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

            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box className="drawer-body">{renderContactDetails()}</Box>
      </Drawer>

      <Box className="map-container">
        <MapView
          contacts={filteredContacts}
          drawerOpen={drawerOpen}
          profile={profile}
          user={session?.user}
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
