import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const initialFormData = {
  nombre: "",
  cargo: "",
  empresa: "",
  ciudad: "",
  telefono: "",
  email: "",
};

export default function AddContactDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  const handleSubmit = () => {
    onSave(formData);
    setFormData(initialFormData);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Nuevo contacto</DialogTitle>

      <DialogContent>
        <TextField
          margin="dense"
          label="Nombre"
          name="nombre"
          fullWidth
          value={formData.nombre}
          onChange={handleChange}
        />

        <TextField
          margin="dense"
          label="Cargo"
          name="cargo"
          fullWidth
          value={formData.cargo}
          onChange={handleChange}
        />

        <TextField
          margin="dense"
          label="Empresa"
          name="empresa"
          fullWidth
          value={formData.empresa}
          onChange={handleChange}
        />

        <TextField
          margin="dense"
          label="Ciudad"
          name="ciudad"
          fullWidth
          value={formData.ciudad}
          onChange={handleChange}
        />

        <TextField
          margin="dense"
          label="Teléfono"
          name="telefono"
          fullWidth
          value={formData.telefono}
          onChange={handleChange}
        />

        <TextField
          margin="dense"
          label="Email"
          name="email"
          fullWidth
          value={formData.email}
          onChange={handleChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}