import { useMemo, useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import dayjs from "dayjs";

const createInitialForm = () => ({
  contacto: null,
  titulo: "",
  descripcion: "",
  lugar: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "programada",
});

function toDatetimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function toDayjsValue(value) {
  return value ? dayjs(value) : null;
}

function toIsoStringValue(value) {
  return value ? value.toISOString() : "";
}

export default function AddMeetingDialog({
  open,
  mode = "create",
  initialData = null,
  contacts = [],
  loading = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(createInitialForm);
  const [errors, setErrors] = useState({});

  const contactOptions = useMemo(() => {
    return contacts.filter((contact) => contact?.id && contact?.nombre);
  }, [contacts]);

  const buildEditForm = () => {
    if (!initialData) return createInitialForm();

    const matchedContact =
      contactOptions.find(
        (contact) =>
          String(contact.id) ===
          String(initialData.contacto_id ?? initialData.contactos?.id),
      ) || null;

    return {
      contacto: matchedContact,
      titulo: initialData.titulo ?? "",
      descripcion: initialData.descripcion ?? "",
      lugar: initialData.lugar ?? "",
      fecha_inicio: toDatetimeLocalValue(initialData.fecha_inicio),
      fecha_fin: toDatetimeLocalValue(initialData.fecha_fin),
      estado: initialData.estado ?? "programada",
    };
  };

  const resetForm = () => {
    if (mode === "edit") {
      setForm(buildEditForm());
    } else {
      setForm(createInitialForm());
    }
    setErrors({});
  };

  const handleOpen = () => {
    resetForm();
  };

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleContactChange = (_, value) => {
    setForm((prev) => ({
      ...prev,
      contacto: value,
    }));

    if (errors.contacto) {
      setErrors((prev) => ({
        ...prev,
        contacto: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.contacto?.id) {
      nextErrors.contacto = "Seleccioná un contacto.";
    }

    if (!form.titulo.trim()) {
      nextErrors.titulo = "Ingresá un título.";
    }

    if (!form.fecha_inicio) {
      nextErrors.fecha_inicio = "Ingresá la fecha de inicio.";
    }

    if (
      form.fecha_inicio &&
      form.fecha_fin &&
      new Date(form.fecha_fin) < new Date(form.fecha_inicio)
    ) {
      nextErrors.fecha_fin =
        "La fecha de fin no puede ser menor a la de inicio.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await onSave?.({
        contacto_id: form.contacto.id,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        lugar: form.lugar.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        estado: form.estado,
      });
    } catch (error) {
      console.error("Error saving meeting:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onEntered={handleOpen}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: "app-dialog-paper",
      }}
    >
      <Box className="app-dialog-header">
        <Stack direction="row" spacing={1.4} alignItems="center">
          <Box className="meeting-dialog-icon-wrap">
            {mode === "edit" ? (
              <EditCalendarOutlinedIcon className="meeting-dialog-icon" />
            ) : (
              <CalendarMonthOutlinedIcon className="meeting-dialog-icon" />
            )}
          </Box>

          <Box>
            <DialogTitle className="app-dialog-title">
              {mode === "edit" ? "Editar reunión" : "Agregar reunión"}
            </DialogTitle>

            <Typography className="app-dialog-subtitle">
              {mode === "edit"
                ? "Actualizá la información de la reunión seleccionada."
                : "Completá los datos para programar una nueva reunión."}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent className="app-dialog-content">
        <Stack spacing={2.2}>
          <Box className="app-dialog-section">
            <Stack spacing={2}>
              <Typography className="app-dialog-section-title">
                Datos principales
              </Typography>

              <Autocomplete
                options={contactOptions}
                value={form.contacto}
                onChange={handleContactChange}
                getOptionLabel={(option) =>
                  `${option.nombre}${option.empresa ? ` · ${option.empresa}` : ""}`
                }
                isOptionEqualToValue={(option, value) =>
                  String(option?.id) === String(value?.id)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Contacto"
                    error={Boolean(errors.contacto)}
                    helperText={errors.contacto}
                  />
                )}
              />

              <TextField
                label="Título"
                value={form.titulo}
                onChange={handleChange("titulo")}
                error={Boolean(errors.titulo)}
                helperText={errors.titulo}
                fullWidth
              />

              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={handleChange("descripcion")}
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                label="Lugar"
                value={form.lugar}
                onChange={handleChange("lugar")}
                fullWidth
              />
            </Stack>
          </Box>

          <Box className="app-dialog-section">
            <Stack spacing={2}>
              <Typography className="app-dialog-section-title">
                Fecha y horario
              </Typography>

              <DateTimePicker
                label="Fecha de inicio"
                value={toDayjsValue(form.fecha_inicio)}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    fecha_inicio: toIsoStringValue(value),
                  }));

                  if (errors.fecha_inicio) {
                    setErrors((prev) => ({
                      ...prev,
                      fecha_inicio: "",
                    }));
                  }
                }}
                ampm={false}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.fecha_inicio),
                    helperText: errors.fecha_inicio,
                  },
                }}
              />

              <DateTimePicker
                label="Fecha de fin"
                value={toDayjsValue(form.fecha_fin)}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    fecha_fin: value ? toIsoStringValue(value) : "",
                  }));

                  if (errors.fecha_fin) {
                    setErrors((prev) => ({
                      ...prev,
                      fecha_fin: "",
                    }));
                  }
                }}
                ampm={false}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.fecha_fin),
                    helperText: errors.fecha_fin,
                  },
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions className="app-dialog-footer">
        <Button
          onClick={handleClose}
          disabled={loading}
          className="app-dialog-cancel-btn"
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          className="app-dialog-submit-btn"
        >
          {loading
            ? mode === "edit"
              ? "Guardando..."
              : "Creando..."
            : mode === "edit"
              ? "Guardar cambios"
              : "Guardar reunión"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
