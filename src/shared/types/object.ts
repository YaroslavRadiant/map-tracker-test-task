export type TrackStatus = "active" | "lost";

export interface TrackedObject {
  id: string;
  lat: number;
  lng: number;
  targetLat: number;
  targetLng: number;
  direction: number;
  isOwn: boolean;
  lastUpdated: number;
  lostAt: number | null;
  status: TrackStatus;
}
