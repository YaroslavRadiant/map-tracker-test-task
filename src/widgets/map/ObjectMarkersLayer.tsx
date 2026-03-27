import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { rootStore } from "../../stores/RootStore";

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

export const ObjectMarkersLayer = observer(() => {
  const map = useMap();

  const objects = rootStore.objectStore.objectsList;
  const selectedId = rootStore.mapUiStore.selectedObjectId;
  const [bounds, setBounds] = useState(map.getBounds());

  useEffect(() => {
    const update = () => setBounds(map.getBounds());

    map.on("moveend zoomend", update);

    return () => {
      map.off("moveend zoomend", update);
    };
  }, [map]);

  const visibleObjects = useMemo(() => {
    return objects.filter((obj) => bounds.contains([obj.lat, obj.lng]));
  }, [objects, bounds]);

  return (
    <>
      {visibleObjects.map((obj) => {
        const isSelected = selectedId === obj.id;

        return (
          <Marker
            key={obj.id}
            position={[obj.lat, obj.lng]}
            icon={getIcon(
              obj.direction,
              obj.status === "lost",
              obj.isOwn,
              isSelected,
            )}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                rootStore.mapUiStore.selectObject(obj.id);
              },
            }}
          />
        );
      })}
    </>
  );
});
