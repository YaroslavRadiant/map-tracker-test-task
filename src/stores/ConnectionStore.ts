import { makeAutoObservable } from "mobx";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export class ConnectionStore {
  status: ConnectionStatus = "idle";
  lastMessageAt: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setConnecting() {
    this.status = "connecting";
  }

  setConnected() {
    this.status = "connected";
  }

  setDisconnected() {
    this.status = "disconnected";
  }

  setMessageReceived() {
    this.lastMessageAt = Date.now();
  }
}
