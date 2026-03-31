import { useCallback, useEffect, useMemo, useState } from "react";
import SidePanel from "../components/layout/SidePanel";
import FullScreenLoader from "../components/common/FullScreenLoader";
import ImportResultsDialog from "../components/common/ImportResultsDialog";
import {
  getContacts,
  getCountries,
  createContact,
  updateContact,
  deleteContact,
} from "../api/contactsApi";
import { exportContactsToExcel } from "../utils/exportExcel";
import { importContactsFromExcel } from "../utils/importExcel";
import {
  Alert,
  AppBar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapView from "../components/MapView";
import AddContactDialog from "../components/AddContactDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import useSession from "../hooks/useSession";
import useProfile from "../hooks/useProfile";
import UserMenu from "../components/auth/UserMenu";

const CONTINENTES = ["Todos", "America", "Europa", "Asia", "Africa", "Oceania"];
const INITIAL_VISIBLE = 5;

export default function HomePage() {
  const { session, loadingSession } = useSession();
  const { profile, loadingProfile } = useProfile(session?.user);
  const isMobile = useMediaQuery("(max-width:768px)");

  const [contacts, setContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [dialogMode, setDialogMode] = useState("create");
  const [contactToEdit, setContactToEdit] = useState(null);
  const [detailContact, setDetailContact] = useState(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("Todos");
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [importing, setImporting] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const [importDetailsOpen, setImportDetailsOpen] = useState(false);
  const [failedImportRows, setFailedImportRows] = useState([]);

  const [visibleContactsCount, setVisibleContactsCount] =
    useState(INITIAL_VISIBLE);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);

      setSelectedContact((prev) => {
        if (!prev) return null;

        const stillExists = data.some(
          (contact) => String(contact.id) === String(prev.id),
        );

        return stillExists ? prev : null;
      });
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
        contact.paises?.continente?.toLowerCase().includes(text) ||
        contact.provincias?.nombre?.toLowerCase().includes(text);

      const matchesContinent =
        selectedContinent === "Todos" ||
        contact.paises?.continente === selectedContinent;

      return matchesSearch && matchesContinent;
    });
  }, [contacts, searchText, selectedContinent]);

  useEffect(() => {
    if (
      selectedContact &&
      !filteredContacts.some((contact) => contact.id === selectedContact.id)
    ) {
      setSelectedContact(null);
    }
  }, [filteredContacts, selectedContact]);

  useEffect(() => {
    setVisibleContactsCount(INITIAL_VISIBLE);
  }, [searchText, selectedContinent]);

  const visibleContacts = filteredContacts.slice(0, visibleContactsCount);
  const remainingContacts = Math.max(
    filteredContacts.length - visibleContacts.length,
    0,
  );

  const handleShowMoreContacts = () => {
    setVisibleContactsCount((prev) =>
      Math.min(prev + 10, filteredContacts.length),
    );
  };

  const handleShowLessContacts = () => {
    setVisibleContactsCount(INITIAL_VISIBLE);
  };

  const showFeedback = (severity, message) => {
    setFeedback({
      open: true,
      severity,
      message,
    });
  };

  const handleCloseFeedback = (_, reason) => {
    if (reason === "clickaway") return;

    setFeedback((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);

    if (isMobile) {
      setPanelOpen(false);
    }
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

    if (isMobile) {
      setPanelOpen(false);
    }

    setOpenDialog(true);
  };

  const handleOpenEdit = (contact) => {
    setDialogMode("edit");
    setContactToEdit(contact);
    setSelectedPosition({
      lat: contact?.lat ?? "",
      lng: contact?.lng ?? "",
    });

    if (isMobile) {
      setPanelOpen(false);
    }

    setOpenDialog(true);
  };

  const handleRecenterMap = () => {
    setSelectedContact(null);

    if (isMobile) {
      setPanelOpen(false);
    }
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
      showFeedback("success", "El contacto se eliminó correctamente.");
    } catch (error) {
      console.error("Error deleting contact:", error);
      showFeedback("error", "No se pudo eliminar el contacto.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateContact = async (formData) => {
    try {
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
        showFeedback("success", "El contacto se actualizó correctamente.");
      } else {
        const createdContact = await createContact(formData);

        setContacts((prev) => [createdContact, ...prev]);
        setSelectedContact(createdContact);
        showFeedback("success", "El contacto se creó correctamente.");
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving contact:", error);
      showFeedback("error", "No se pudo guardar el contacto.");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";

    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setImporting(true);
        setFailedImportRows([]);
        setImportDetailsOpen(false);

        const result = await importContactsFromExcel(file);

        await loadContacts();

        const {
          creados = 0,
          duplicados = 0,
          fallidos = 0,
          total = 0,
          failedRows = [],
        } = result || {};

        setFailedImportRows(failedRows);

        if (fallidos > 0) {
          setImportDetailsOpen(true);
        }

        showFeedback(
          fallidos > 0 ? "warning" : "success",
          `Importación completada. Total: ${total}. Creados: ${creados}. Duplicados: ${duplicados}. Fallidos: ${fallidos}.`,
        );
      } catch (error) {
        console.error("Error importing Excel:", error);
        showFeedback(
          "error",
          error?.message ||
            "No se pudo importar el archivo. Revisá el formato e intentá nuevamente.",
        );
      } finally {
        setImporting(false);
      }
    };

    input.click();
  };

  const handleExport = () => {
    try {
      exportContactsToExcel(filteredContacts);
      showFeedback(
        "success",
        `Exportación completada. Se exportaron ${filteredContacts.length} contactos.`,
      );
    } catch (error) {
      console.error("Error exporting contacts:", error);
      showFeedback("error", "No se pudo exportar el archivo.");
    }
  };

  const renderContactDetails = () => {
    return (
      <Stack spacing={2}>
        <Button
          variant="contained"
          onClick={handleOpenCreate}
          className="panel-primary-btn"
          sx={{
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 800,
            py: 1.2,
          }}
        >
          Agregar contacto
        </Button>

        <Typography className="section-title">
          Contactos encontrados ({filteredContacts.length})
        </Typography>

        <Stack spacing={1.2} className="country-list">
          {visibleContacts.map((contact) => (
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

          {filteredContacts.length > INITIAL_VISIBLE && (
            <Stack spacing={0.8} sx={{ pt: 0.5 }}>
              {visibleContactsCount < filteredContacts.length ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleShowMoreContacts}
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
                    Quedan {remainingContacts} contacto
                    {remainingContacts === 1 ? "" : "s"}
                  </Typography>
                </>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleShowLessContacts}
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
          )}

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
    return (
      <FullScreenLoader
        title="Cargando sesión..."
        subtitle="Estamos preparando tu mapa de contactos."
      />
    );
  }

  return (
    <>
      <Box className="app-root">
        <Box className="mini-sidebar">
          <Stack spacing={1.2} alignItems="center">
            <IconButton onClick={togglePanel} className="mini-sidebar-btn">
              <MenuIcon />
            </IconButton>

            <IconButton
              onClick={handleRecenterMap}
              className="mini-sidebar-btn mini-sidebar-btn--recenter"
              title="Recentrar mapa"
            >
              <MyLocationIcon />
            </IconButton>
          </Stack>
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
                        onClick={handleImport}
                        disabled={importing}
                        sx={{
                          height: 48,
                          px: 2.2,
                          borderRadius: "16px",
                          textTransform: "none",
                          fontWeight: 400,
                          fontSize: "0.8rem",
                          background:
                            "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          boxShadow: "0 12px 24px rgba(22, 163, 74, 0.24)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                            boxShadow: "0 14px 28px rgba(22, 163, 74, 0.30)",
                          },
                        }}
                      >
                        Importar
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={importing}
                        sx={{
                          height: 48,
                          px: 2.2,
                          borderRadius: "16px",
                          textTransform: "none",
                          fontWeight: 400,
                          fontSize: "0.8rem",
                          color: "#16a34a",
                          borderColor: "rgba(22, 163, 74, 0.55)",
                          backgroundColor: "rgba(255,255,255,0.94)",
                          "&:hover": {
                            borderColor: "#15803d",
                            backgroundColor: "rgba(22, 163, 74, 0.08)",
                          },
                        }}
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
                      <b>Provincia:</b>{" "}
                      {detailContact.provincias?.nombre || "-"}
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
                        <div
                          key={empleado.id}
                          className="contact-modal-employee"
                        >
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

      <Backdrop
        open={importing}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 20,
          backgroundColor: "rgba(15, 23, 42, 0.35)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Box
          sx={{
            minWidth: { xs: 280, sm: 360 },
            px: 4,
            py: 4,
            borderRadius: "24px",
            textAlign: "center",
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow:
              "0 24px 70px rgba(15, 23, 42, 0.14), 0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress
              size={38}
              thickness={4.6}
              sx={{ color: "#2563eb" }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Importando contactos...
            </Typography>
            <Typography
              sx={{ color: "#475569", fontSize: "14px", maxWidth: 260 }}
            >
              Estamos procesando el archivo y validando los datos.
            </Typography>
          </Stack>
        </Box>
      </Backdrop>

      <Snackbar
        open={feedback.open}
        autoHideDuration={5500}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
            alignItems: "center",
          }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <ImportResultsDialog
        open={importDetailsOpen}
        onClose={() => setImportDetailsOpen(false)}
        failedRows={failedImportRows}
      />
    </>
  );
}