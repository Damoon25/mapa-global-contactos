import { useCallback, useEffect, useMemo, useState } from "react";
import SidePanel from "../components/layout/SidePanel";
import FullScreenLoader from "../components/common/FullScreenLoader";
import ImportResultsDialog from "../components/common/ImportResultsDialog";
import AgendaPanel from "../components/panels/AgendaPanel";
import AddMeetingDialog from "../components/panels/AddMeetingDialog";
import UpcomingMeetingNotifier from "../components/panels/UpcomingMeetingNotifier";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../api/meetingsApi";
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
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
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
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
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
  const [hasBootstrappedApp, setHasBootstrappedApp] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  const [contacts, setContacts] = useState([]);
  const [countries, setCountries] = useState([]);

  const [meetings, setMeetings] = useState([]);
  const [meetingNotification, setMeetingNotification] = useState(null);
  const [meetingNotificationOpen, setMeetingNotificationOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [meetingDialogMode, setMeetingDialogMode] = useState("create");
  const [meetingToEdit, setMeetingToEdit] = useState(null);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [deleteMeetingDialogOpen, setDeleteMeetingDialogOpen] = useState(false);
  const [deletingMeeting, setDeletingMeeting] = useState(false);

  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [dialogMode, setDialogMode] = useState("create");
  const [contactToEdit, setContactToEdit] = useState(null);
  const [detailContact, setDetailContact] = useState(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [panelView, setPanelView] = useState("contacts");
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

  const [advancedFilters, setAdvancedFilters] = useState({
    country: "",
    city: "",
    company: "",
    hasEmail: false,
    hasPhone: false,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bulkToolsOpen, setBulkToolsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  const loadMeetings = useCallback(async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error("Error loading meetings:", error);
      setMeetings([]);
    }
  }, []);

  useEffect(() => {
    if (!loadingSession && !loadingProfile && session?.user) {
      loadContacts();
      loadCountries();
      loadMeetings();
    }
  }, [
    loadContacts,
    loadCountries,
    loadMeetings,
    loadingSession,
    loadingProfile,
    session,
  ]);

  useEffect(() => {
    if (meetingNotification) {
      setMeetingNotificationOpen(true);
    }
  }, [meetingNotification]);

  useEffect(() => {
    if (!hasBootstrappedApp && !loadingSession && !loadingProfile) {
      setHasBootstrappedApp(true);
    }
  }, [hasBootstrappedApp, loadingSession, loadingProfile]);

  const baseFilteredContacts = useMemo(() => {
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

  const filteredContacts = useMemo(() => {
    const country = advancedFilters.country.trim().toLowerCase();
    const city = advancedFilters.city.trim().toLowerCase();
    const company = advancedFilters.company.trim().toLowerCase();

    return baseFilteredContacts.filter((contact) => {
      const matchesCountry =
        !country || contact.paises?.nombre?.toLowerCase().includes(country);

      const matchesCity =
        !city ||
        contact.ciudades?.name?.toLowerCase().includes(city) ||
        contact.provincias?.nombre?.toLowerCase().includes(city);

      const matchesCompany =
        !company || contact.empresa?.toLowerCase().includes(company);

      const matchesEmail =
        !advancedFilters.hasEmail || Boolean(contact.email?.trim());

      const matchesPhone =
        !advancedFilters.hasPhone || Boolean(contact.telefono?.trim());

      return (
        matchesCountry &&
        matchesCity &&
        matchesCompany &&
        matchesEmail &&
        matchesPhone
      );
    });
  }, [baseFilteredContacts, advancedFilters]);

  useEffect(() => {
    if (
      selectedContact &&
      !filteredContacts.some((contact) => contact.id === selectedContact.id)
    ) {
      setSelectedContact(null);
    }
  }, [filteredContacts, selectedContact]);

  useEffect(() => {
    setSelectedContactIds((prev) =>
      prev.filter((selectedId) =>
        filteredContacts.some(
          (contact) => String(contact.id) === String(selectedId),
        ),
      ),
    );
  }, [filteredContacts]);

  useEffect(() => {
    setVisibleContactsCount(INITIAL_VISIBLE);
  }, [searchText, selectedContinent, advancedFilters]);

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

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({
      country: "",
      city: "",
      company: "",
      hasEmail: false,
      hasPhone: false,
    });
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev;

      if (!next) {
        setSelectedContactIds([]);
      }

      return next;
    });
  };

  const handleOpenCreateMeeting = () => {
    setMeetingDialogMode("create");
    setMeetingToEdit(null);
    setMeetingDialogOpen(true);
  };

  const handleOpenEditMeeting = (meeting) => {
    setMeetingDialogMode("edit");
    setMeetingToEdit(meeting);
    setMeetingDialogOpen(true);
  };

  const handleCloseCreateMeeting = () => {
    if (savingMeeting) return;
    setMeetingDialogOpen(false);
    setMeetingToEdit(null);
    setMeetingDialogMode("create");
  };

  const handleCreateMeeting = async (payload) => {
    try {
      setSavingMeeting(true);

      if (meetingDialogMode === "edit" && meetingToEdit?.id) {
        await updateMeeting(meetingToEdit.id, payload);
        showFeedback("success", "La reunión se actualizó correctamente.");
      } else {
        await createMeeting(payload);
        showFeedback("success", "La reunión se creó correctamente.");
      }

      await loadMeetings();

      setMeetingDialogOpen(false);
      setMeetingToEdit(null);
      setMeetingDialogMode("create");
    } catch (error) {
      console.error("Error saving meeting:", error);
      showFeedback("error", "No se pudo guardar la reunión.");
    } finally {
      setSavingMeeting(false);
    }
  };

  const handleAskDeleteMeeting = (meeting) => {
    setMeetingToDelete(meeting);
    setDeleteMeetingDialogOpen(true);
  };

  const handleCloseDeleteMeetingDialog = () => {
    if (deletingMeeting) return;
    setDeleteMeetingDialogOpen(false);
    setMeetingToDelete(null);
  };

  const handleConfirmDeleteMeeting = async () => {
    if (!meetingToDelete?.id) return;

    try {
      setDeletingMeeting(true);

      await deleteMeeting(meetingToDelete.id);
      await loadMeetings();

      setDeleteMeetingDialogOpen(false);
      setMeetingToDelete(null);

      showFeedback("success", "La reunión se eliminó correctamente.");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      showFeedback("error", "No se pudo eliminar la reunión.");
    } finally {
      setDeletingMeeting(false);
    }
  };

  const handleToggleContactSelection = (contactId) => {
    setSelectedContactIds((prev) => {
      const exists = prev.some((id) => String(id) === String(contactId));

      if (exists) {
        return prev.filter((id) => String(id) !== String(contactId));
      }

      return [...prev, contactId];
    });
  };

  const handleCloseMeetingNotification = (_, reason) => {
    if (reason === "clickaway") return;
    setMeetingNotificationOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedContactIds([]);
  };

  const handleSelectAllFiltered = () => {
    setSelectedContactIds(filteredContacts.map((contact) => contact.id));
  };

  const togglePanel = () => {
    setPanelOpen((prev) => {
      const next = !prev;

      if (next) {
        setPanelView("contacts");
      }

      return next;
    });
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const openContactsPanel = () => {
    setPanelView("contacts");
    setPanelOpen(true);
  };

  const openCalendarPanel = () => {
    setPanelView("calendar");
    setPanelOpen(true);

    if (isMobile) {
      setSelectedContact(null);
    }
  };

  const openDashboardPanel = () => {
    setPanelView("dashboard");
    setPanelOpen(true);

    if (isMobile) {
      setSelectedContact(null);
    }
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

  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) return;

    try {
      setBulkDeleting(true);

      await Promise.all(
        selectedContactIds.map((contactId) => deleteContact(contactId)),
      );

      setContacts((prev) =>
        prev.filter(
          (contact) =>
            !selectedContactIds.some(
              (selectedId) => String(selectedId) === String(contact.id),
            ),
        ),
      );

      if (
        selectedContact &&
        selectedContactIds.some(
          (selectedId) => String(selectedId) === String(selectedContact.id),
        )
      ) {
        setSelectedContact(null);
      }

      if (
        detailContact &&
        selectedContactIds.some(
          (selectedId) => String(selectedId) === String(detailContact.id),
        )
      ) {
        setDetailContact(null);
      }

      setSelectedContactIds([]);
      setSelectionMode(false);
      setBulkToolsOpen(false);

      showFeedback(
        "success",
        `Se eliminaron ${selectedContactIds.length} contactos correctamente.`,
      );
    } catch (error) {
      console.error("Error deleting contacts:", error);
      showFeedback(
        "error",
        "No se pudieron eliminar los contactos seleccionados.",
      );
    } finally {
      setBulkDeleting(false);
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

  const renderPanelContent = () => {
    if (panelView === "calendar") {
      return (
        <AgendaPanel
          meetings={meetings}
          onOpenCreateMeeting={handleOpenCreateMeeting}
          onEditMeeting={handleOpenEditMeeting}
          onDeleteMeeting={handleAskDeleteMeeting}
          onSelectContact={(contact) => {
            setSelectedContact(contact);

            if (isMobile) {
              setPanelOpen(false);
            }
          }}
        />
      );
    }

    if (panelView === "dashboard") {
      return (
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Dashboard
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Acá se muestran estadísticas generales sobre tus contactos.
          </Typography>

          <Stack spacing={1.5}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total de contactos
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {contacts.length}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Países visibles
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {
                    new Set(
                      filteredContacts
                        .map((contact) => contact.paises?.nombre)
                        .filter(Boolean),
                    ).size
                  }
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      );
    }

    return renderContactDetails();
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

        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant={filtersOpen ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen((prev) => !prev)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Filtros
            </Button>

            <Button
              variant={bulkToolsOpen ? "contained" : "outlined"}
              color={bulkToolsOpen ? "error" : "inherit"}
              startIcon={<DeleteSweepIcon />}
              onClick={() => setBulkToolsOpen((prev) => !prev)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Borrar todo
            </Button>
          </Stack>

          <Collapse in={filtersOpen}>
            <Stack
              spacing={1.2}
              sx={{
                p: 1.5,
                borderRadius: "16px",
                border: "1px solid rgba(226,232,240,0.95)",
                bgcolor: "rgba(255,255,255,0.88)",
                boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
              }}
            >
              <TextField
                size="small"
                label="País"
                value={advancedFilters.country}
                onChange={(e) =>
                  handleAdvancedFilterChange("country", e.target.value)
                }
              />

              <TextField
                size="small"
                label="Ciudad / Provincia"
                value={advancedFilters.city}
                onChange={(e) =>
                  handleAdvancedFilterChange("city", e.target.value)
                }
              />

              <TextField
                size="small"
                label="Empresa"
                value={advancedFilters.company}
                onChange={(e) =>
                  handleAdvancedFilterChange("company", e.target.value)
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={advancedFilters.hasEmail}
                    onChange={(e) =>
                      handleAdvancedFilterChange("hasEmail", e.target.checked)
                    }
                  />
                }
                label="Solo contactos con email"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={advancedFilters.hasPhone}
                    onChange={(e) =>
                      handleAdvancedFilterChange("hasPhone", e.target.checked)
                    }
                  />
                }
                label="Solo contactos con teléfono"
              />

              <Divider />

              <Button
                variant="text"
                onClick={handleClearAdvancedFilters}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Limpiar filtros
              </Button>
            </Stack>
          </Collapse>

          <Collapse in={bulkToolsOpen}>
            <Stack
              spacing={1.2}
              sx={{
                p: 1.5,
                borderRadius: "16px",
                border: "1px solid rgba(254,226,226,0.95)",
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant={selectionMode ? "contained" : "outlined"}
                  startIcon={<CheckBoxOutlinedIcon />}
                  onClick={handleToggleSelectionMode}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {selectionMode ? "Cancelar selección" : "Seleccionar"}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DoneAllIcon />}
                  onClick={handleSelectAllFiltered}
                  disabled={!selectionMode || filteredContacts.length === 0}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Seleccionar todo
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleBulkDelete}
                  disabled={
                    !selectionMode ||
                    selectedContactIds.length === 0 ||
                    bulkDeleting
                  }
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  {bulkDeleting
                    ? "Borrando..."
                    : `Borrar (${selectedContactIds.length})`}
                </Button>
              </Stack>

              {selectionMode ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={`${selectedContactIds.length} seleccionados`}
                    sx={{ fontWeight: 700 }}
                  />

                  {selectedContactIds.length > 0 ? (
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={handleClearSelection}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Limpiar selección
                    </Button>
                  ) : null}
                </Stack>
              ) : null}
            </Stack>
          </Collapse>
        </Stack>

        <Stack spacing={1.2} className="country-list">
          {visibleContacts.map((contact) => {
            const isChecked = selectedContactIds.some(
              (id) => String(id) === String(contact.id),
            );

            return (
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
                    {selectionMode ? (
                      <Checkbox
                        checked={isChecked}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() =>
                          handleToggleContactSelection(contact.id)
                        }
                        sx={{ pt: 0.1, pr: 0.5 }}
                      />
                    ) : null}

                    <Box className="country-card-main">
                      <Typography className="country-card-title">
                        {contact.nombre}
                      </Typography>

                      <Typography className="country-card-subtitle">
                        {contact.paises?.nombre || "-"} ·{" "}
                        {contact.empresa || "-"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.6,
                          color: "#64748b",
                          fontSize: "0.82rem",
                        }}
                      >
                        {contact.ciudades?.name ||
                          contact.provincias?.nombre ||
                          "Sin ciudad"}{" "}
                        · {contact.cargo || "Sin cargo"}
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
            );
          })}

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

  if (!hasBootstrappedApp && (loadingSession || loadingProfile)) {
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
            <IconButton
              onClick={openContactsPanel}
              className="mini-sidebar-btn"
              title="Contactos"
            >
              <MenuIcon />
            </IconButton>

            <IconButton
              onClick={openCalendarPanel}
              className="mini-sidebar-btn"
              title="Calendario"
            >
              <CalendarMonthIcon />
            </IconButton>

            <IconButton
              onClick={openDashboardPanel}
              className="mini-sidebar-btn"
              title="Dashboard"
            >
              <InsightsOutlinedIcon />
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
          title={
            panelView === "calendar"
              ? "Agenda global"
              : panelView === "dashboard"
                ? "Dashboard"
                : "Mapa de contactos"
          }
          subtitle={
            panelView === "calendar"
              ? "Reuniones y cronograma"
              : panelView === "dashboard"
                ? "Métricas y actividad"
                : "Directorio internacional"
          }
        >
          {renderPanelContent()}
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

        <AddMeetingDialog
          open={meetingDialogOpen}
          mode={meetingDialogMode}
          initialData={meetingToEdit}
          contacts={contacts}
          loading={savingMeeting}
          onClose={handleCloseCreateMeeting}
          onSave={handleCreateMeeting}
        />

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          title="Eliminar contacto"
          message="Vas a eliminar este contacto junto con sus empleados asociados."
          itemLabel={contactToDelete?.nombre || ""}
          loading={deleting}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />

        <ConfirmDeleteDialog
          open={deleteMeetingDialogOpen}
          title="Eliminar reunión"
          message="Vas a eliminar esta reunión y no vas a poder recuperarla después."
          itemLabel={meetingToDelete?.titulo || ""}
          loading={deletingMeeting}
          onClose={handleCloseDeleteMeetingDialog}
          onConfirm={handleConfirmDeleteMeeting}
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

      <UpcomingMeetingNotifier
        meetings={meetings}
        enabled={hasBootstrappedApp}
        open={meetingNotificationOpen}
        onClose={handleCloseMeetingNotification}
        notification={meetingNotification}
        setNotification={setMeetingNotification}
      />

      <ImportResultsDialog
        open={importDetailsOpen}
        onClose={() => setImportDetailsOpen(false)}
        failedRows={failedImportRows}
      />
    </>
  );
}
