import { observer } from "mobx-react-lite";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useStores } from "../../providers/useStores";

function formatTimestamp(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Date(value).toLocaleTimeString();
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

export const SelectedObjectPanel = observer(() => {
  const { objectStore, mapUiStore } = useStores();

  const selectedId = mapUiStore.selectedObjectId;
  const selectedObject = selectedId
    ? (objectStore.objects.get(selectedId) ?? null)
    : null;

  if (!selectedObject) {
    return null;
  }

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
        width: 320,
        p: 2,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6">Об'єкт</Typography>

        <IconButton size="small" onClick={() => mapUiStore.clearSelection()}>
          &#10060;
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip
          size="small"
          label={selectedObject.isOwn ? "Own" : "Enemy"}
          color={selectedObject.isOwn ? "success" : "error"}
        />
        <Chip
          size="small"
          label={selectedObject.status}
          color={selectedObject.status === "lost" ? "warning" : "primary"}
        />
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Stack spacing={1}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            ID
          </Typography>
          <Typography variant="body2">{selectedObject.id}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Coordinates
          </Typography>
          <Typography variant="body2">
            {formatCoordinate(selectedObject.lat)},{" "}
            {formatCoordinate(selectedObject.lng)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Direction
          </Typography>
          <Typography variant="body2">
            {Math.round(selectedObject.direction)}°
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Last updated
          </Typography>
          <Typography variant="body2">
            {formatTimestamp(selectedObject.lastUpdated)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Lost at
          </Typography>
          <Typography variant="body2">
            {formatTimestamp(selectedObject.lostAt)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
});
