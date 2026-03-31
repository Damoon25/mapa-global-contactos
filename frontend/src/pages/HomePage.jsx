import { useCallback, useEffect, useMemo, useState } from "react";
import SidePanel from "../components/layout/SidePanel";
import {
  getContacts,
  getCountries,
  createContact,
  updateContact,
  deleteContact,
} from "../api/contactsApi";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import MapView from "../components/MapView";
import AddContactDialog from "../components/AddContactDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import useSession from "../hooks/useSession";
import useProfile from "../hooks/useProfile";
import UserMenu from "../components/auth/UserMenu";

const CONTINENTES = ["Todos", "America", "Europa", "Asia", "Africa", "Oceania"];

export default function HomePage() {
  const { session, loadingSession } = useSession();
  const { profile, loadingProfile } = useProfile(session?.user);

  const [contacts, setContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [dialogMode, setDialogMode] = useState("create");
  const [contactToEdit, setContactToEdit] = useState(null);
  const [detailContact, setDetailContact] = useState(null);

  const [panelOpen, setPanelOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("Todos");
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);

      if (data.length > 0) {
        setSelectedContact((prev) => prev ?? data[0]);
      } else {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCountries = useCallback(async () => {
    try {
      const data = await getCountries();
      setCountries(data);
      console.log("Countries loaded:", data);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  }, []);

  useEffect(() => {
    if (!loadingSession && !loadingProfile && session?.user) {
      loadContacts();
      loadCountries();
    }
  }, [loadContacts, loadCountries, loadingSession, loadingProfile, session]);

  const filteredContacts = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        !text ||
        contact.nombre?.toLowerCase().includes(text) ||
        contact.cargo?.toLowerCase().includes(text) ||
        contact.empresa?.toLowerCase().includes(text) ||
        contact.ciudades?.name?.toLowerCase().includes(text) ||
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

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleViewMore = (contact) => {
    setDetailContact(contact);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPosition(null);
    setContactToEdit(null);
    setDialogMode("create");
  };

  const handleOpenCreate = () => {
    setDialogMode("create");
    setContactToEdit(null);
    setSelectedPosition(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (contact) => {
    setDialogMode("edit");
    setContactToEdit(contact);
    setSelectedPosition({
      lat: contact?.lat ?? "",
      lng: contact?.lng ?? "",
    });
    setOpenDialog(true);
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete?.id) return;

    try {
      setDeleting(true);

      await deleteContact(contactToDelete.id);

      setContacts((prev) =>
        prev.filter(
          (contact) => String(contact.id) !== String(contactToDelete.id),
        ),
      );

      if (String(selectedContact?.id) === String(contactToDelete.id)) {
        setSelectedContact(null);
      }

      if (String(detailContact?.id) === String(contactToDelete.id)) {
        setDetailContact(null);
      }

      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateContact = async (formData) => {
    try {
      console.log("Modo:", dialogMode);
      console.log("Received form data:", formData);
      console.log("Selected position:", selectedPosition);
      console.log("Editing contact:", contactToEdit);

      if (dialogMode === "edit" && contactToEdit?.id) {
        const updatedContact = await updateContact(contactToEdit.id, formData);

        setContacts((prev) =>
          prev.map((contact) =>
            String(contact.id) === String(contactToEdit.id)
              ? updatedContact
              : contact,
          ),
        );

        setSelectedContact(updatedContact);
      } else {
        const createdContact = await createContact(formData);

        setContacts((prev) => [createdContact, ...prev]);
        setSelectedContact(createdContact);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const handleImport = () => {
    console.log("Import file");
  };

  const handleExport = () => {
    console.log("Export file");
  };

  const renderContactDetails = () => {
    return (
      <Stack spacing={2}>
        <Button
          variant="contained"
          onClick={handleOpenCreate}
          className="panel-primary-btn"
        >
          Agregar contacto
        </Button>

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
              <CardContent
                className="country-card-content"
                sx={{ "&:last-child": { pb: 2 } }}
              >
                <Box className="country-card-top">
                  <Box className="country-card-main">
                    <Typography className="country-card-title">
                      {contact.nombre}
                    </Typography>
                    <Typography className="country-card-subtitle">
                      {contact.paises?.nombre || "-"} · {contact.empresa || "-"}
                    </Typography>
                  </Box>

                  <Box className="country-card-actions">
                    <IconButton
                      size="small"
                      className="contact-action-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenEdit(contact);
                      }}
                    >
                      ✎
                    </IconButton>

                    <IconButton
                      size="small"
                      className="contact-action-btn contact-action-btn--danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteContact(contact);
                      }}
                    >
                      🗑
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {!loading && filteredContacts.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No se encontraron contactos con esos filtros.
            </Typography>
          )}
        </Stack>
      </Stack>
    );
  };

  if (loadingSession || loadingProfile) {
    return <p style={{ padding: "24px" }}>Cargando sesión...</p>;
  }

  return (
    <Box className="app-root">
      <Box className="mini-sidebar">
        <IconButton onClick={togglePanel}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Box className="mobile-menu-button">
        <IconButton onClick={togglePanel}>
          <MenuIcon />
        </IconButton>
      </Box>

      <AppBar position="absolute" className="topbar">
        <Toolbar className="topbar-toolbar">
          <Box className="topbar-panel">
            <Box className="topbar-layout">
              <Box className="topbar-row topbar-row--main">
                <Box className="topbar-left">
                  <Box className="topbar-search-row">
                    <IconButton
                      className="menu-btn topbar-menu-btn"
                      onClick={togglePanel}
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
                </Box>
              </Box>

              <Box className="topbar-row topbar-row--continents">
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

              <Box className="topbar-row topbar-row--actions">
                <Box className="topbar-actions-slot">
                  <Stack
                    direction="row"
                    spacing={1}
                    className="actions-wrap topbar-actions-wrap"
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

                    <Box className="topbar-user-slot">
                      <UserMenu user={session?.user} profile={profile} />
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <SidePanel
        open={panelOpen}
        onClose={closePanel}
        title="Mapa de contactos"
        subtitle="Directorio internacional"
      >
        {renderContactDetails()}
      </SidePanel>

      <Box className="map-container">
        <MapView
          contacts={filteredContacts}
          drawerOpen={panelOpen}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
          onEditContact={handleOpenEdit}
          onDeleteContact={handleDeleteContact}
          onViewMore={handleViewMore}
        />
      </Box>

      <AddContactDialog
        open={openDialog}
        mode={dialogMode}
        initialData={contactToEdit}
        onClose={handleCloseDialog}
        onSave={handleCreateContact}
        selectedPosition={selectedPosition}
        countries={countries}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        contact={contactToDelete}
        loading={deleting}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {detailContact && (
        <div
          className="contact-modal-overlay"
          onClick={() => setDetailContact(null)}
        >
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setDetailContact(null)}
            >
              ×
            </button>

            <div className="contact-modal-header">
              <div className="contact-modal-avatar">
                {(detailContact.nombre || "?").charAt(0).toUpperCase()}
              </div>

              <div className="contact-modal-header-text">
                <h2>{detailContact.nombre || "Sin nombre"}</h2>
                <p>{detailContact.empresa || "Sin empresa"}</p>
              </div>
            </div>

            <div className="contact-modal-chips">
              {detailContact.paises?.nombre && (
                <span>{detailContact.paises.nombre}</span>
              )}
              {detailContact.ciudad && (
                <span>{detailContact.ciudades?.name || "-"}</span>
              )}
              {detailContact.cargo && <span>{detailContact.cargo}</span>}
            </div>

            <div className="contact-modal-grid">
              <div className="contact-modal-card">
                <h3>Resumen del contacto</h3>
                <div className="contact-modal-info-list">
                  <p>
                    <b>País:</b> {detailContact.paises?.nombre || "-"}
                  </p>
                  <p>
                    <b>Ciudad:</b> {detailContact.ciudades?.name || "-"}
                  </p>
                  <p>
                    <b>Dirección:</b> {detailContact.direccion || "-"}
                  </p>
                  <p>
                    <b>Empresa:</b> {detailContact.empresa || "-"}
                  </p>
                  <p>
                    <b>Cargo:</b> {detailContact.cargo || "-"}
                  </p>
                  <p>
                    <b>Teléfono:</b> {detailContact.telefono || "-"}
                  </p>
                  <p>
                    <b>Email:</b> {detailContact.email || "-"}
                  </p>
                </div>
              </div>

              <div className="contact-modal-card">
                <h3>Empleados asociados</h3>

                {detailContact.empleados?.length > 0 ? (
                  <div className="contact-modal-employees">
                    {detailContact.empleados.map((empleado) => (
                      <div key={empleado.id} className="contact-modal-employee">
                        <div className="contact-modal-employee-name">
                          {empleado.nombre}
                        </div>
                        <div className="contact-modal-employee-role">
                          {empleado.cargo || "Sin cargo"}
                        </div>
                        {empleado.telefono && <div>{empleado.telefono}</div>}
                        {empleado.email && <div>{empleado.email}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="contact-modal-empty">
                    No hay empleados cargados.
                  </div>
                )}
              </div>
            </div>

            <div className="contact-modal-actions">
              <button
                className="contact-modal-btn contact-modal-btn--secondary"
                onClick={() => {
                  setDetailContact(null);
                  handleOpenEdit(detailContact);
                }}
              >
                Editar
              </button>

              <button
                className="contact-modal-btn contact-modal-btn--danger"
                onClick={() => {
                  setDetailContact(null);
                  handleDeleteContact(detailContact);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
