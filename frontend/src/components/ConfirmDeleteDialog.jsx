import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function ConfirmDeleteDialog({
  open,
  contact = null,
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <DeleteOutlineIcon color="error" />
        Eliminar contacto
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Typography variant="body1">
            {contact?.nombre ? (
              <>
                Vas a eliminar a <strong>{contact.nombre}</strong>.
              </>
            ) : (
              "Vas a eliminar este contacto."
            )}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Esta acción eliminará también los empleados asociados y no se puede deshacer.
          </Typography>

          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Confirmá solo si realmente querés borrar este registro.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, justifyContent: "space-between" }}>
        <Button onClick={onClose} disabled={loading} sx={{ borderRadius: 999 }}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          sx={{ borderRadius: 999, px: 3 }}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}