import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ImportResultsDialog({
  open,
  onClose,
  failedRows = [],
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow:
            "0 24px 70px rgba(15, 23, 42, 0.18), 0 10px 30px rgba(15, 23, 42, 0.10)",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Detalle de filas no importadas
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.92rem",
              color: "#64748b",
            }}
          >
            Revisá qué filas fallaron y por qué.
          </Typography>
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: "#f8fafc" }}>
        {failedRows.length === 0 ? (
          <Alert
            severity="success"
            sx={{
              borderRadius: "16px",
              alignItems: "center",
            }}
          >
            No hubo filas fallidas en la importación.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Alert
              severity="warning"
              icon={<ErrorOutlineIcon />}
              sx={{
                borderRadius: "16px",
                alignItems: "center",
              }}
            >
              Se encontraron {failedRows.length} fila(s) con errores durante la
              importación.
            </Alert>

            {failedRows.map((item, index) => (
              <Paper
                key={`${item.fila}-${index}`}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                <Stack spacing={1.2}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={`Fila ${item.fila}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        background: "rgba(239, 68, 68, 0.12)",
                        color: "#b91c1c",
                      }}
                    />

                    {item.contacto_ref ? (
                      <Chip
                        label={item.contacto_ref}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {item.nombre || "Sin nombre informado"}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.75,
                        fontSize: "0.92rem",
                        color: "#475569",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.motivo}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
