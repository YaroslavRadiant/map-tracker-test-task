import { makeAutoObservable } from "mobx";
import type { TrackedObject } from "../shared/types/object";

type IncomingObject = {
  id: string;
  lat: number;
  lng: number;
  direction: number;
  isOwn: boolean;
};

const LOST_TIMEOUT_MS = 10_000;
const REMOVE_TIMEOUT_MS = 5 * 60_000;

export class ObjectStore {
  objects = new Map<string, TrackedObject>();

  constructor() {
    makeAutoObservable(this);
  }

  upsertMany(items: IncomingObject[]) {
    const now = Date.now();

    for (const item of items) {
      const existing = this.objects.get(item.id);

      if (!existing) {
        this.objects.set(item.id, {
          id: item.id,
          lat: item.lat,
          lng: item.lng,
          targetLat: item.lat,
          targetLng: item.lng,
          direction: item.direction,
          isOwn: item.isOwn,
          lastUpdated: now,
          lostAt: null,
          status: "active",
        });
        continue;
      }

      if (existing.status === "lost") {
        continue;
      }

      existing.targetLat = item.lat;
      existing.targetLng = item.lng;
      existing.direction = item.direction;
      existing.isOwn = item.isOwn;
      existing.lastUpdated = now;
    }
  }

  animateStep(alpha = 0.28) {
    for (const obj of this.objects.values()) {
      if (obj.status === "lost") {
        continue;
      }

      const nextLat = obj.lat + (obj.targetLat - obj.lat) * alpha;
      const nextLng = obj.lng + (obj.targetLng - obj.lng) * alpha;

      if (Math.abs(nextLat - obj.lat) > 0.00002) {
        obj.lat = nextLat;
      }

      if (Math.abs(nextLng - obj.lng) > 0.00002) {
        obj.lng = nextLng;
      }
    }
  }

  checkLostObjects() {
    const now = Date.now();

    for (const obj of this.objects.values()) {
      if (obj.status === "lost") {
        continue;
      }

      if (now - obj.lastUpdated > LOST_TIMEOUT_MS) {
        obj.status = "lost";
        obj.lostAt = now;
      }
    }
  }

  removeExpiredObjects() {
    const now = Date.now();

    for (const [id, obj] of this.objects.entries()) {
      if (obj.status !== "lost" || obj.lostAt === null) {
        continue;
      }

      if (now - obj.lostAt > REMOVE_TIMEOUT_MS) {
        this.objects.delete(id);
      }
    }
  }

  clear() {
    this.objects.clear();
  }

  get objectsList() {
    return Array.from(this.objects.values());
  }

  get stats() {
    let own = 0;
    let enemy = 0;
    let lost = 0;

    for (const item of this.objects.values()) {
      if (item.status === "lost") {
        lost += 1;
      } else if (item.isOwn) {
        own += 1;
      } else {
        enemy += 1;
      }
    }

    return { own, enemy, lost };
  }
}
