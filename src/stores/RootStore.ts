import { AuthStore } from "./AuthStore";
import { ObjectStore } from "./ObjectStore";
import { ConnectionStore } from "./ConnectionStore";
import { MapUiStore } from "./MapUiStore";

export class RootStore {
  authStore: AuthStore;
  objectStore: ObjectStore;
  connectionStore: ConnectionStore;
  mapUiStore: MapUiStore;

  constructor() {
    this.authStore = new AuthStore();
    this.objectStore = new ObjectStore();
    this.connectionStore = new ConnectionStore();
    this.mapUiStore = new MapUiStore();
  }
}

export const rootStore = new RootStore();
export type { RootStore as RootStoreType };
