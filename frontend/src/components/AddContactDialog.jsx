import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCitiesByCountry,
  getProvincesByCountry,
} from "../api/contactsApi";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PublicIcon from "@mui/icons-material/Public";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "live.com",
];

const createEmptyEmployee = () => ({
  id: `tmp-${Date.now()}-${Math.random()}`,
  nombre: "",
  cargo: "",
  telefono: "",
  email: "",
});

const createInitialForm = () => ({
  pais_id: "",
  provincia_id: "",
  ciudad_id: "",
  nombre: "",
  cargo: "",
  empresa: "",
  ciudad: "",
  direccion: "",
  telefono: "",
  email: "",
  lat: "",
  lng: "",
  empleados: [],
});

const normalizePhoneWithPrefix = (phoneValue, prefix) => {
  const safePhone = (phoneValue || "").trim();
  const safePrefix = (prefix || "").trim();

  if (!safePrefix) return safePhone;
  if (!safePhone) return `${safePrefix} `;

  const localNumber = safePhone.replace(/^\+\d+(?:-\d+)?\s*/, "").trim();

  return localNumber ? `${safePrefix} ${localNumber}` : `${safePrefix} `;
};

const getDomainSuggestions = (email) => {
  if (!email.includes("@")) return [];

  const [localPart, partialDomain = ""] = email.split("@");
  if (!localPart.trim()) return [];

  return EMAIL_DOMAINS.filter((domain) =>
    domain.toLowerCase().includes(partialDomain.trim().toLowerCase()),
  ).map((domain) => `${localPart}@${domain}`);
};

export default function AddContactDialog({
  open,
  mode = "create",
  initialData = null,
  selectedPosition = null,
  countries = [],
  onClose,
  onSave,
  loading = false,
}) {
  const [form, setForm] = useState(createInitialForm());
  const [errors, setErrors] = useState({});
  const [emailMenuAnchor, setEmailMenuAnchor] = useState(null);

  const [cities, setCities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const emailInputRef = useRef(null);

  const isEditMode = mode === "edit";

  const selectedCountry = useMemo(() => {
    return (
      countries.find(
        (country) => String(country.id) === String(form.pais_id),
      ) || null
    );
  }, [countries, form.pais_id]);

  const selectedProvince = useMemo(() => {
    return (
      provinces.find(
        (province) => String(province.id) === String(form.provincia_id),
      ) || null
    );
  }, [provinces, form.provincia_id]);

  const selectedCity = useMemo(() => {
    return (
      cities.find((city) => String(city.id) === String(form.ciudad_id)) ||
      null
    );
  }, [cities, form.ciudad_id]);

  const isArgentinaSelected =
    selectedCountry?.iso === "AR" ||
    selectedCountry?.nombre?.toLowerCase() === "argentina";

  const emailSuggestions = useMemo(() => {
    return getDomainSuggestions(form.email);
  }, [form.email]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      const nextForm = createInitialForm();

      if (initialData) {
        nextForm.pais_id = initialData.pais_id ?? "";
        nextForm.provincia_id = initialData.provincia_id ?? "";
        nextForm.ciudad_id = initialData.ciudad_id ?? "";
        nextForm.nombre = initialData.nombre ?? "";
        nextForm.cargo = initialData.cargo ?? "";
        nextForm.empresa = initialData.empresa ?? "";
        nextForm.ciudad = initialData.ciudades?.name ?? "";
        nextForm.direccion = initialData.direccion ?? "";
        nextForm.telefono = initialData.telefono ?? "";
        nextForm.email = initialData.email ?? "";
        nextForm.lat = initialData.lat ?? "";
        nextForm.lng = initialData.lng ?? "";
        nextForm.empleados = Array.isArray(initialData.empleados)
          ? initialData.empleados.map((empleado) => ({
              id: empleado.id ?? `tmp-${Date.now()}-${Math.random()}`,
              nombre: empleado.nombre ?? "",
              cargo: empleado.cargo ?? "",
              telefono: empleado.telefono ?? "",
              email: empleado.email ?? "",
            }))
          : [];
      } else {
        nextForm.lat = selectedPosition?.lat ?? "";
        nextForm.lng = selectedPosition?.lng ?? "";
      }

      setForm(nextForm);
      setErrors({});
      setCitySearch(nextForm.ciudad || "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open, initialData, selectedPosition]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      const shouldOpenMenu =
        Boolean(emailInputRef.current) &&
        form.email.includes("@") &&
        emailSuggestions.length > 0 &&
        !EMAIL_DOMAINS.some((domain) =>
          form.email.toLowerCase().endsWith(`@${domain}`),
        );

      setEmailMenuAnchor(shouldOpenMenu ? emailInputRef.current : null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [form.email, emailSuggestions, open]);

  useEffect(() => {
    const loadProvinces = async () => {
      if (!form.pais_id || !isArgentinaSelected) {
        setProvinces([]);
        return;
      }

      try {
        setLoadingProvinces(true);
        const data = await getProvincesByCountry({
          paisId: Number(form.pais_id),
        });
        setProvinces(data);
      } catch (error) {
        console.error(error);
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, [form.pais_id, isArgentinaSelected]);

  useEffect(() => {
    const loadCities = async () => {
      if (!form.pais_id) {
        setCities([]);
        return;
      }

      if (isArgentinaSelected && !form.provincia_id) {
        setCities([]);
        return;
      }

      try {
        setLoadingCities(true);
        const data = await getCitiesByCountry({
          paisId: Number(form.pais_id),
          provinciaId: form.provincia_id ? Number(form.provincia_id) : null,
          search: citySearch,
        });
        setCities(data);
      } catch (error) {
        console.error(error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    const timer = setTimeout(() => {
      loadCities();
    }, 250);

    return () => clearTimeout(timer);
  }, [form.pais_id, form.provincia_id, citySearch, isArgentinaSelected]);

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

  const handleCountryChange = (_, country) => {
    const prefix = country?.codigo_telefono || "";

    setForm((prev) => ({
      ...prev,
      pais_id: country?.id ?? "",
      provincia_id: "",
      ciudad_id: "",
      ciudad: "",
      lat: "",
      lng: "",
      telefono: normalizePhoneWithPrefix(prev.telefono, prefix),
    }));

    setCities([]);
    setProvinces([]);
    setCitySearch("");

    if (errors.pais_id) {
      setErrors((prev) => ({
        ...prev,
        pais_id: "",
      }));
    }
  };

  const handleProvinceChange = (_, province) => {
    setForm((prev) => ({
      ...prev,
      provincia_id: province?.id ?? "",
      ciudad_id: "",
      ciudad: "",
      lat: "",
      lng: "",
    }));

    setCities([]);
    setCitySearch("");
  };

  const handleCityChange = (_, city) => {
    setForm((prev) => ({
      ...prev,
      ciudad_id: city?.id ?? "",
      ciudad: city?.name ?? "",
      lat: city?.lat ?? "",
      lng: city?.lng ?? "",
    }));

    setCitySearch(city?.name ?? "");

    if (errors.ciudad) {
      setErrors((prev) => ({
        ...prev,
        ciudad: "",
      }));
    }

    if (errors.ubicacion) {
      setErrors((prev) => ({
        ...prev,
        ubicacion: "",
      }));
    }
  };

  const handleEmployeeChange = (employeeId, field, value) => {
    setForm((prev) => ({
      ...prev,
      empleados: prev.empleados.map((empleado) =>
        empleado.id === employeeId
          ? {
              ...empleado,
              [field]: value,
            }
          : empleado,
      ),
    }));
  };

  const handleAddEmployee = () => {
    const prefix = selectedCountry?.codigo_telefono || "";

    setForm((prev) => ({
      ...prev,
      empleados: [
        ...prev.empleados,
        {
          ...createEmptyEmployee(),
          telefono: prefix ? `${prefix} ` : "",
        },
      ],
    }));
  };

  const handleRemoveEmployee = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      empleados: prev.empleados.filter(
        (empleado) => empleado.id !== employeeId,
      ),
    }));
  };

  const handleEmailSuggestionClick = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      email: suggestion,
    }));
    setEmailMenuAnchor(null);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.pais_id) nextErrors.pais_id = "Seleccioná un país.";
    if (!form.ciudad_id) nextErrors.ciudad = "Seleccioná una ciudad válida.";
    if (!form.nombre.trim()) nextErrors.nombre = "Ingresá el nombre.";
    if (!form.telefono.trim()) nextErrors.telefono = "Ingresá el teléfono.";
    if (!form.email.trim()) nextErrors.email = "Ingresá el email.";

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Ingresá un email válido.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const resolvedLat = form.lat === "" ? null : Number(form.lat);
    const resolvedLng = form.lng === "" ? null : Number(form.lng);
    const resolvedCiudadId =
      form.ciudad_id === "" ? null : Number(form.ciudad_id);

    if (!resolvedCiudadId || resolvedLat == null || resolvedLng == null) {
      setErrors((prev) => ({
        ...prev,
        ubicacion: "Seleccioná una ciudad válida desde la lista.",
      }));
      return;
    }

    const payload = {
      pais_id: Number(form.pais_id),
      provincia_id: form.provincia_id ? Number(form.provincia_id) : null,
      ciudad_id: resolvedCiudadId,
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim(),
      empresa: form.empresa.trim(),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      lat: resolvedLat,
      lng: resolvedLng,
      empleados: form.empleados
        .map((empleado) => ({
          nombre: empleado.nombre.trim(),
          cargo: empleado.cargo.trim(),
          telefono: empleado.telefono.trim(),
          email: empleado.email.trim(),
        }))
        .filter(
          (empleado) =>
            empleado.nombre ||
            empleado.cargo ||
            empleado.telefono ||
            empleado.email,
        ),
    };

    await onSave(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        className: "contact-dialog-paper",
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
        },
      }}
    >
      <Box
        className="contact-dialog-header"
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.06) 100%)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              {isEditMode ? (
                <EditOutlinedIcon color="primary" />
              ) : (
                <AddIcon color="primary" />
              )}
              <DialogTitle sx={{ p: 0, fontWeight: 700 }}>
                {isEditMode ? "Editar contacto" : "Agregar contacto"}
              </DialogTitle>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {isEditMode
                ? "Actualizá la información del contacto y sus empleados asociados."
                : "Completá los datos principales."}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Paper
              variant="outlined"
              className="contact-dialog-section"
              sx={{
                borderRadius: 3,
                p: { xs: 2, sm: 2.5 },
                borderColor: "rgba(148,163,184,0.25)",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonOutlineIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Datos principales
                  </Typography>
                </Stack>

                <Box
                  className="contact-dialog-grid"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                    alignItems: "start",
                    width: "100%",
                    maxWidth: "100%",
                    mx: "auto",
                    "& > *": {
                      minWidth: 0,
                      width: "100%",
                    },
                  }}
                >
                  <Box>
                    <Autocomplete
                      options={countries || []}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      getOptionLabel={(option) =>
                        option?.nombre
                          ? `${option.nombre}${option.codigo_telefono ? ` (${option.codigo_telefono})` : ""}`
                          : ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        String(option.id) === String(value.id)
                      }
                      ListboxProps={{
                        sx: {
                          fontSize: "0.75rem",
                          color: "rgba(0,0,0,0.7)",
                          padding: "4px 0",
                        },
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <span style={{ fontWeight: 400 }}>
                            {option.nombre}
                          </span>
                          <span style={{ marginLeft: 6, color: "#6b7280" }}>
                            {option.codigo_telefono}
                          </span>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="País"
                          error={Boolean(errors.pais_id)}
                          helperText={
                            errors.pais_id ||
                            "Elegí el país para cargar el prefijo."
                          }
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <PublicIcon
                                  sx={{ color: "text.secondary", mr: 1 }}
                                  fontSize="small"
                                />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>

                  {isArgentinaSelected && (
                    <Box>
                      <Autocomplete
                        options={provinces || []}
                        value={selectedProvince}
                        loading={loadingProvinces}
                        onChange={handleProvinceChange}
                        getOptionLabel={(option) => option?.nombre || ""}
                        isOptionEqualToValue={(option, value) =>
                          String(option.id) === String(value.id)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Provincia"
                            placeholder="Seleccioná una provincia"
                          />
                        )}
                      />
                    </Box>
                  )}

                  <Box>
                    <Autocomplete
                      options={cities || []}
                      value={selectedCity}
                      loading={loadingCities}
                      onChange={handleCityChange}
                      inputValue={citySearch}
                      onInputChange={(_, newInputValue) => {
                        setCitySearch(newInputValue);
                      }}
                      getOptionLabel={(option) => option?.name || ""}
                      isOptionEqualToValue={(option, value) =>
                        String(option.id) === String(value.id)
                      }
                      noOptionsText={
                        form.pais_id
                          ? isArgentinaSelected && !form.provincia_id
                            ? "Elegí una provincia primero"
                            : "No se encontraron ciudades"
                          : "Elegí un país primero"
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="Ciudad"
                          placeholder="Seleccioná una ciudad"
                          error={Boolean(errors.ciudad)}
                          helperText={errors.ciudad}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <LocationOnOutlinedIcon
                                  sx={{ color: "text.secondary", mr: 1 }}
                                  fontSize="small"
                                />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={form.nombre}
                      onChange={handleChange("nombre")}
                      error={Boolean(errors.nombre)}
                      helperText={errors.nombre}
                      placeholder="Ej. Jhon Doe"
                      InputProps={{
                        startAdornment: (
                          <PersonOutlineIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                            fontSize="small"
                          />
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={form.cargo}
                      onChange={handleChange("cargo")}
                      placeholder="Ej. Director Comercial"
                      InputProps={{
                        startAdornment: (
                          <WorkOutlineIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                            fontSize="small"
                          />
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Empresa"
                      value={form.empresa}
                      onChange={handleChange("empresa")}
                      placeholder="Ej. Empresa SA"
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={form.direccion}
                      onChange={handleChange("direccion")}
                      placeholder="Ej. Av. Corrientes 1234"
                      InputProps={{
                        startAdornment: (
                          <LocationOnOutlinedIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                            fontSize="small"
                          />
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={form.telefono}
                      onChange={handleChange("telefono")}
                      error={Boolean(errors.telefono)}
                      helperText={
                        errors.telefono ||
                        (selectedCountry?.codigo_telefono
                          ? `Prefijo sugerido: ${selectedCountry.codigo_telefono}`
                          : "Seleccioná un país para completar el prefijo automáticamente.")
                      }
                      placeholder="+54 11 1234 5678"
                      InputProps={{
                        startAdornment: (
                          <PhoneOutlinedIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                            fontSize="small"
                          />
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Email"
                      value={form.email}
                      onChange={handleChange("email")}
                      error={Boolean(errors.email)}
                      helperText={
                        errors.email ||
                        "Cuando escribís @ aparecen sugerencias."
                      }
                      placeholder="nombre@dominio.com"
                      inputRef={emailInputRef}
                      InputProps={{
                        startAdornment: (
                          <EmailOutlinedIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                            fontSize="small"
                          />
                        ),
                      }}
                    />
                    <Menu
                      anchorEl={emailMenuAnchor}
                      open={
                        Boolean(emailMenuAnchor) && emailSuggestions.length > 0
                      }
                      onClose={() => setEmailMenuAnchor(null)}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      PaperProps={{
                        sx: {
                          mt: 0.5,
                          borderRadius: 2,
                          minWidth: 270,
                        },
                      }}
                    >
                      {emailSuggestions.map((suggestion) => (
                        <MenuItem
                          key={suggestion}
                          onClick={() => handleEmailSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Box>

                {errors.ubicacion && (
                  <Typography variant="body2" color="error">
                    {errors.ubicacion}
                  </Typography>
                )}
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                p: 2.5,
                borderColor: "rgba(148,163,184,0.25)",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Empleados asociados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Podés cargar varios empleados relacionados al contacto
                      principal.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddEmployee}
                    sx={{ borderRadius: 999 }}
                  >
                    Agregar empleado
                  </Button>
                </Stack>

                {form.empleados.length === 0 ? (
                  <Paper
                    variant="outlined"
                    className="contact-dialog-section"
                    sx={{
                      borderRadius: 3,
                      p: 2,
                      bgcolor: "grey.50",
                      borderStyle: "dashed",
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography fontWeight={600}>
                        No hay empleados cargados
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Este bloque es opcional. Podés guardar solo el contacto
                        principal.
                      </Typography>
                    </Stack>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {form.empleados.map((empleado, index) => (
                      <Paper
                        key={empleado.id}
                        variant="outlined"
                        className="contact-dialog-section"
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          borderColor: "rgba(148,163,184,0.25)",
                        }}
                      >
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Chip
                                size="small"
                                label={`Empleado ${index + 1}`}
                                color="primary"
                                variant="outlined"
                              />
                            </Stack>

                            <IconButton
                              color="error"
                              onClick={() => handleRemoveEmployee(empleado.id)}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Stack>

                          <Divider />

                          <Grid container spacing={2} alignItems="stretch">
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Nombre"
                                value={empleado.nombre}
                                onChange={(event) =>
                                  handleEmployeeChange(
                                    empleado.id,
                                    "nombre",
                                    event.target.value,
                                  )
                                }
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Cargo"
                                value={empleado.cargo}
                                onChange={(event) =>
                                  handleEmployeeChange(
                                    empleado.id,
                                    "cargo",
                                    event.target.value,
                                  )
                                }
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Teléfono"
                                value={empleado.telefono}
                                onChange={(event) =>
                                  handleEmployeeChange(
                                    empleado.id,
                                    "telefono",
                                    event.target.value,
                                  )
                                }
                                placeholder={
                                  selectedCountry?.codigo_telefono
                                    ? `${selectedCountry.codigo_telefono} ...`
                                    : "Teléfono"
                                }
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Email"
                                value={empleado.email}
                                onChange={(event) =>
                                  handleEmployeeChange(
                                    empleado.id,
                                    "email",
                                    event.target.value,
                                  )
                                }
                              />
                            </Grid>
                          </Grid>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions
        className="contact-dialog-footer"
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          className="contact-dialog-cancel-btn"
          sx={{ borderRadius: 999 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          className="contact-dialog-submit-btn"
          sx={{ borderRadius: 999, px: 3 }}
        >
          {loading
            ? "Guardando..."
            : isEditMode
              ? "Guardar cambios"
              : "Crear contacto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}