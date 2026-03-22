import { useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { ObjectMarkersLayer } from "./ObjectMarkersLayer";
import { SelectedObjectPanel } from "./SelectedObjectPanel";

export function MapWidget() {
  const center = useMemo<[number, number]>(() => [48.282, 37.181], []);

  return (
    <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        preferCanvas
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ObjectMarkersLayer />
      </MapContainer>

      <SelectedObjectPanel />

      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1000,
          p: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Легенда
        </Typography>

        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: "#2e7d32", fontSize: 18, lineHeight: 1 }}>▲</Box>
            <Typography variant="body2">Свій активний</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: "#d32f2f", fontSize: 18, lineHeight: 1 }}>▲</Box>
            <Typography variant="body2">Ворожий активний</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: "#2e7d32", fontSize: 18, lineHeight: 1 }}>✖</Box>
            <Typography variant="body2">Свій втрачений</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: "#d32f2f", fontSize: 18, lineHeight: 1 }}>✖</Box>
            <Typography variant="body2">Ворожий втрачений</Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
