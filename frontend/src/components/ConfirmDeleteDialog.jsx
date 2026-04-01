import {
  Alert,
  Box,
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
  title = "Eliminar registro",
  message = "Esta acción no se puede deshacer.",
  itemLabel = "",
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
        className: "app-dialog-paper danger-dialog-paper",
      }}
    >
      <Box className="app-dialog-header danger-dialog-header">
        <Box className="danger-dialog-icon-wrap">
          <DeleteOutlineIcon className="danger-dialog-icon" />
        </Box>

        <DialogTitle className="danger-dialog-title">
          {title}
        </DialogTitle>

        <Typography className="danger-dialog-subtitle">
          Confirmá solo si realmente querés continuar.
        </Typography>
      </Box>

      <DialogContent className="danger-dialog-content">
        <Stack spacing={2}>
          <Typography className="danger-dialog-message">
            {message}
          </Typography>

          {itemLabel ? (
            <Box className="danger-dialog-highlight">
              <Typography className="danger-dialog-highlight-label">
                Elemento afectado
              </Typography>
              <Typography className="danger-dialog-highlight-value">
                {itemLabel}
              </Typography>
            </Box>
          ) : null}

          <Alert
            severity="warning"
            className="danger-dialog-alert"
          >
            Esta acción es permanente y no se puede deshacer.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions className="app-dialog-footer danger-dialog-footer">
        <Button
          onClick={onClose}
          disabled={loading}
          className="app-dialog-cancel-btn"
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          className="danger-dialog-submit-btn"
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}