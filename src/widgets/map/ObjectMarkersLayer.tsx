import { useEffect, useRef } from "react";
import { reaction } from "mobx";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { rootStore } from "../../stores/RootStore";

type MarkerEntry = {
  marker: L.Marker;
  lastKey: string;
};

const iconCache = new Map<string, L.DivIcon>();

function getIcon(
  direction: number,
  isLost: boolean,
  isOwn: boolean,
  isSelected: boolean,
) {
  const roundedDirection = Math.round(direction / 15) * 15;
  const key = `${roundedDirection}-${isLost}-${isOwn}-${isSelected}`;

  const cached = iconCache.get(key);
  if (cached) return cached;

  const color = isOwn ? "#2e7d32" : "#d32f2f";
  const size = isSelected ? 22 : 18;

  const html = isLost
    ? `<div style="font-size:${size}px;color:${color}">✖</div>`
    : `<div style="transform:rotate(${roundedDirection}deg);font-size:${size}px;color:${color}">▲</div>`;

  const icon = L.divIcon({
    className: "",
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  iconCache.set(key, icon);
  return icon;
}

function getMarkerKey(
  direction: number,
  isLost: boolean,
  isOwn: boolean,
  isSelected: boolean,
) {
  const roundedDirection = Math.round(direction / 15) * 15;
  return `${roundedDirection}-${isLost}-${isOwn}-${isSelected}`;
}

export function ObjectMarkersLayer() {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    layerGroupRef.current = layer;

    const handleMapClick = () => {
      rootStore.mapUiStore.clearSelection();
    };

    map.on("click", handleMapClick);

    const dispose = reaction(
      () => {
        const selectedId = rootStore.mapUiStore.selectedObjectId;

        return rootStore.objectStore.objectsList.map((obj) => ({
          id: obj.id,
          lat: obj.lat,
          lng: obj.lng,
          direction: obj.direction,
          isOwn: obj.isOwn,
          isLost: obj.status === "lost",
          isSelected: selectedId === obj.id,
        }));
      },
      (objects) => {
        const layer = layerGroupRef.current;
        if (!layer) return;

        const currentBounds = map.getBounds();

        const visibleObjects = objects.filter((obj) =>
          currentBounds.contains([obj.lat, obj.lng]),
        );

        const visibleIds = new Set(visibleObjects.map((o) => o.id));

        for (const [id, entry] of markersRef.current.entries()) {
          if (!visibleIds.has(id)) {
            layer.removeLayer(entry.marker);
            markersRef.current.delete(id);
          }
        }

        for (const obj of visibleObjects) {
          const markerKey = getMarkerKey(
            obj.direction,
            obj.isLost,
            obj.isOwn,
            obj.isSelected,
          );

          const existing = markersRef.current.get(obj.id);

          if (!existing) {
            const marker = L.marker([obj.lat, obj.lng], {
              icon: getIcon(
                obj.direction,
                obj.isLost,
                obj.isOwn,
                obj.isSelected,
              ),
            });

            marker.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              rootStore.mapUiStore.selectObject(obj.id);
            });

            marker.addTo(layer);

            markersRef.current.set(obj.id, {
              marker,
              lastKey: markerKey,
            });

            continue;
          }

          existing.marker.setLatLng([obj.lat, obj.lng]);

          if (existing.lastKey !== markerKey) {
            existing.marker.setIcon(
              getIcon(obj.direction, obj.isLost, obj.isOwn, obj.isSelected),
            );
            existing.lastKey = markerKey;
          }
        }

        const selectedId = rootStore.mapUiStore.selectedObjectId;
        if (selectedId && !visibleIds.has(selectedId)) {
          rootStore.mapUiStore.clearSelection();
        }
      },
      { fireImmediately: true },
    );

    return () => {
      dispose();

      map.off("click", handleMapClick);

      for (const entry of markersRef.current.values()) {
        layer.removeLayer(entry.marker);
      }

      markersRef.current.clear();
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
