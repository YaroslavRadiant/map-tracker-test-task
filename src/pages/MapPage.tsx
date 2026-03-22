import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { AppBar, Box, Button, Chip, Stack, Toolbar } from "@mui/material";
import { MapWidget } from "../widgets/map/MapWidget";
import { SocketClient } from "../shared/api/socketClient";
import { useStores } from "../providers/useStores";

type ServerObject = {
  id: string;
  lat: number;
  lng: number;
  direction: number;
  isOwn: boolean;
};

type SocketMessage =
  | { type: "connected" }
  | { type: "objects"; items: ServerObject[] };

const FRAME_INTERVAL = 1000 / 12;

function getWsUrl(apiKey: string) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  return `${protocol}//${host}/ws?key=${encodeURIComponent(apiKey)}`;
}

export const MapPage = observer(() => {
  const { authStore, objectStore, connectionStore, mapUiStore } = useStores();
  const { own, enemy, lost } = objectStore.stats;

  useEffect(() => {
    if (!authStore.apiKey) {
      return;
    }

    objectStore.clear();
    mapUiStore.clearSelection();
    connectionStore.setConnecting();

    const client = new SocketClient<SocketMessage>(
      () => getWsUrl(authStore.apiKey),
      {
        onOpen: () => {
          connectionStore.setConnected();
        },

        onClose: () => {
          connectionStore.setDisconnected();
        },

        onError: (error) => {
          console.error("WebSocket error:", error);
          connectionStore.setDisconnected();
        },

        onMessage: (message) => {
          connectionStore.setMessageReceived();

          if (message.type === "objects") {
            objectStore.upsertMany(message.items);
          }
        },
      },
    );

    client.connect();

    let animationFrameId = 0;
    let lastFrameTime = 0;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
        objectStore.animateStep(0.28);
        lastFrameTime = timestamp;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const lostInterval = setInterval(() => {
      objectStore.checkLostObjects();
    }, 250);

    const cleanupInterval = setInterval(() => {
      objectStore.removeExpiredObjects();
    }, 1000);

    return () => {
      client.disconnect();
      cancelAnimationFrame(animationFrameId);
      clearInterval(lostInterval);
      clearInterval(cleanupInterval);
    };
  }, [authStore.apiKey, objectStore, connectionStore, mapUiStore]);

  const statusColor =
    connectionStore.status === "connected"
      ? "success"
      : connectionStore.status === "connecting"
        ? "warning"
        : "error";

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={connectionStore.status} color={statusColor} />
            <Chip label={`Own: ${own}`} color="success" />
            <Chip label={`Enemy: ${enemy}`} color="error" />
            <Chip label={`Lost: ${lost}`} color="warning" />

            <Button color="inherit" onClick={() => authStore.logout()}>
              Вийти
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1 }}>
        <MapWidget />
      </Box>
    </Box>
  );
});
