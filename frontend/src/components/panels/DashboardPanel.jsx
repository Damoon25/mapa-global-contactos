import { useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { forwardRef } from "react";
import Fade from "@mui/material/Fade";
import Zoom from "@mui/material/Zoom";
import { Gauge } from "@mui/x-charts/Gauge";
import { getDashboardMetrics } from "../../utils/dashboardMetrics";

const DASHBOARD_COLORS = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const DashboardDialogTransition = forwardRef(
  function DashboardDialogTransition(props, ref) {
    return <Zoom ref={ref} {...props} />;
  },
);

export default function DashboardPanel({ contacts = [], meetings = [] }) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const metrics = getDashboardMetrics({ contacts, meetings });
  const [activeModal, setActiveModal] = useState(null);

  const companiesTotal = useMemo(
    () => metrics.topCompanies.reduce((acc, item) => acc + item.value, 0),
    [metrics.topCompanies],
  );

  const cards = [
    {
      id: "summary",
      title: "Resumen general",
      subtitle: "Contactos, países y reuniones",
      icon: <BadgeRoundedIcon />,
      preview: (
        <Stack spacing={1.1} sx={{ mt: 1.2 }}>
          <MiniMetricRow label="Contactos" value={metrics.totalContacts} />
          <MiniMetricRow label="Países" value={metrics.totalCountries} />
          <MiniMetricRow label="Reuniones" value={metrics.totalMeetings} />
          <MiniMetricRow
            label="Próximas (7d)"
            value={metrics.upcomingMeetings}
          />
        </Stack>
      ),
      modalContent: (
        <Stack spacing={1.2}>
          <SummaryBigRow
            icon={<BadgeRoundedIcon />}
            label="Contactos"
            value={metrics.totalContacts}
          />
          <SummaryBigRow
            icon={<PublicRoundedIcon />}
            label="Países"
            value={metrics.totalCountries}
          />
          <SummaryBigRow
            icon={<EventRoundedIcon />}
            label="Reuniones"
            value={metrics.totalMeetings}
          />
          <SummaryBigRow
            icon={<EventRoundedIcon />}
            label="Próximas (7d)"
            value={metrics.upcomingMeetings}
          />
        </Stack>
      ),
    },
    {
      id: "roles",
      title: "Cargos frecuentes",
      subtitle: "Distribución de roles",
      icon: <BadgeRoundedIcon />,
      preview: (
        <MiniList
          items={metrics.topRoles.slice(0, 3).map((item) => ({
            label: item.role,
            value: item.total,
          }))}
        />
      ),
      modalContent: (
        <BarChart
          dataset={metrics.topRoles}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "role",
            },
          ]}
          series={[
            {
              dataKey: "total",
              label: "Contactos",
            },
          ]}
          colors={[DASHBOARD_COLORS[0]]}
          height={isMobile ? 280 : 340}
          margin={{ top: 20, right: 20, bottom: 50, left: 40 }}
          borderRadius={10}
          grid={{ horizontal: true }}
        />
      ),
    },
    {
      id: "companies",
      title: "Empresas destacadas",
      subtitle: "Mayor presencia actual",
      icon: <BusinessRoundedIcon />,
      preview: (
        <MiniList
          items={metrics.topCompanies.slice(0, 3).map((item) => ({
            label: item.label,
            value: item.value,
          }))}
        />
      ),
      modalContent: (
        <Box
          className="dashboard-modal-pie-layout"
          sx={{
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          <Box className="dashboard-modal-pie-chart-box">
            <PieChart
              series={[
                {
                  data: metrics.topCompanies.map((item, index) => ({
                    ...item,
                    color: DASHBOARD_COLORS[index % DASHBOARD_COLORS.length],
                  })),
                  innerRadius: isMobile ? 60 : 70,
                  outerRadius: isMobile ? 110 : 128,
                  paddingAngle: 3,
                  cornerRadius: 7,
                  cx: isMobile ? 140 : 160,
                  cy: isMobile ? 140 : 160,
                },
              ]}
              height={isMobile ? 280 : 320}
              width={isMobile ? 280 : 320}
              hideLegend
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            />

            <Box className="dashboard-modal-pie-center">
              <Typography className="dashboard-modal-pie-center-value">
                {companiesTotal}
              </Typography>
              <Typography className="dashboard-modal-pie-center-text">
                empresas
              </Typography>
            </Box>
          </Box>

          <Stack className="dashboard-modal-pie-legend" spacing={1}>
            {metrics.topCompanies.map((item, index) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={1}
                alignItems="center"
                className="dashboard-modal-pie-legend-row"
              >
                <Box
                  className="dashboard-modal-pie-legend-dot"
                  sx={{
                    backgroundColor:
                      DASHBOARD_COLORS[index % DASHBOARD_COLORS.length],
                  }}
                />
                <Typography className="dashboard-modal-pie-legend-label">
                  {item.label}
                </Typography>
                <Typography className="dashboard-modal-pie-legend-value">
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ),
    },
    {
      id: "meetings",
      title: "Ritmo de reuniones",
      subtitle: "Relación entre próximas y total",
      icon: <EventRoundedIcon />,
      preview: (
        <Box className="dashboard-gauge-preview">
          <Typography className="dashboard-gauge-preview-value">
            {metrics.upcomingMeetingsRatio}%
          </Typography>
          <Typography className="dashboard-gauge-preview-label">
            próximas
          </Typography>
        </Box>
      ),
      modalContent: (
        <Box className="dashboard-gauge-modal-wrap">
          <Gauge
            width={isMobile ? 260 : 320}
            height={isMobile ? 220 : 260}
            value={metrics.upcomingMeetingsRatio}
            startAngle={-110}
            endAngle={110}
            innerRadius="72%"
            outerRadius="100%"
            text={({ value }) => `${value}%`}
          />
        </Box>
      ),
    },
    {
      id: "countries",
      title: "Top países",
      subtitle: "Dónde tenés más contactos",
      icon: <PublicRoundedIcon />,
      preview: (
        <MiniList
          items={metrics.topCountries.slice(0, 3).map((item) => ({
            label: item.country,
            value: item.total,
          }))}
        />
      ),
      modalContent: (
        <BarChart
          dataset={metrics.topCountries}
          yAxis={[
            {
              scaleType: "band",
              dataKey: "country",
            },
          ]}
          xAxis={[
            {
              label: "Cantidad",
            },
          ]}
          layout="horizontal"
          series={[
            {
              dataKey: "total",
              label: "Contactos",
            },
          ]}
          colors={[DASHBOARD_COLORS[1]]}
          height={isMobile ? 320 : 360}
          margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
          borderRadius={10}
          grid={{ vertical: true }}
        />
      ),
    },
    {
      id: "continents",
      title: "Continentes",
      subtitle: "Distribución geográfica",
      icon: <LanguageRoundedIcon />,
      preview: (
        <MiniList
          items={metrics.continentData.slice(0, 3).map((item) => ({
            label: item.label,
            value: item.value,
          }))}
        />
      ),
      modalContent: (
        <Stack spacing={1.2}>
          {metrics.continentData.length === 0 ? (
            <Typography className="dashboard-empty-text">Sin datos</Typography>
          ) : (
            metrics.continentData.map((item, index) => {
              const percent =
                metrics.totalContacts > 0
                  ? Math.round((item.value / metrics.totalContacts) * 100)
                  : 0;

              return (
                <Box key={item.label} className="dashboard-continent-row">
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.8 }}
                  >
                    <Typography className="dashboard-continent-label">
                      {item.label}
                    </Typography>
                    <Typography className="dashboard-continent-value">
                      {item.value} · {percent}%
                    </Typography>
                  </Stack>

                  <Box className="dashboard-progress-track">
                    <Box
                      className="dashboard-progress-fill"
                      sx={{
                        width: `${percent}%`,
                        background:
                          DASHBOARD_COLORS[index % DASHBOARD_COLORS.length],
                      }}
                    />
                  </Box>
                </Box>
              );
            })
          )}
        </Stack>
      ),
    },
  ];

  const currentCard = cards.find((card) => card.id === activeModal);

  return (
    <>
      <Stack spacing={1.6} className="dashboard-cards-stack">
        {cards.map((card) => (
          <Box key={card.id} className="dashboard-card-slot">
            <Paper
              elevation={0}
              className="dashboard-entry-card"
              onClick={() => setActiveModal(card.id)}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 1.4 }}
              >
                <Box className="dashboard-entry-icon">{card.icon}</Box>
                <ArrowOutwardRoundedIcon className="dashboard-entry-arrow" />
              </Stack>

              <Typography className="dashboard-entry-title">
                {card.title}
              </Typography>

              <Typography className="dashboard-entry-subtitle">
                {card.subtitle}
              </Typography>

              <Box className="dashboard-entry-preview">{card.preview}</Box>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Dialog
        open={Boolean(currentCard)}
        onClose={() => setActiveModal(null)}
        fullWidth
        maxWidth="md"
        TransitionComponent={DashboardDialogTransition}
        transitionDuration={{ enter: 260, exit: 180 }}
        PaperProps={{
          className: "dashboard-chart-dialog-paper",
        }}
      >
        <DialogTitle className="dashboard-chart-dialog-title-wrap">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography className="dashboard-chart-dialog-title">
                {currentCard?.title}
              </Typography>
              <Typography className="dashboard-chart-dialog-subtitle">
                {currentCard?.subtitle}
              </Typography>
            </Box>

            <IconButton
              onClick={() => setActiveModal(null)}
              className="dashboard-chart-dialog-close"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent className="dashboard-chart-dialog-content">
          {currentCard?.modalContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MiniMetricRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      className="dashboard-mini-row"
    >
      <Typography className="dashboard-mini-row-label">{label}</Typography>
      <Typography className="dashboard-mini-row-value">{value}</Typography>
    </Stack>
  );
}

function SummaryBigRow({ icon, label, value }) {
  return (
    <Box className="dashboard-summary-row">
      <Box className="dashboard-summary-icon">{icon}</Box>

      <Box className="dashboard-summary-text">
        <Typography className="dashboard-summary-label">{label}</Typography>
        <Typography className="dashboard-summary-value">{value}</Typography>
      </Box>
    </Box>
  );
}

function MiniList({ items = [] }) {
  if (!items.length) {
    return <Typography className="dashboard-empty-text">Sin datos</Typography>;
  }

  return (
    <Stack spacing={0.8}>
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          className="dashboard-mini-row"
        >
          <Typography className="dashboard-mini-row-label">
            {item.label}
          </Typography>
          <Typography className="dashboard-mini-row-value">
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
