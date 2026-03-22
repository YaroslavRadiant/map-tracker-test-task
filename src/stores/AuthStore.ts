import { makeAutoObservable } from "mobx";

const STORAGE_KEY = "api_key";

function parseApiKey(key: string): boolean {
  try {
    const decoded = atob(key.trim());
    const parts = decoded.split(":");

    if (parts.length !== 2) {
      return false;
    }

    const [prefix, seed] = parts;

    const isValidPrefix = prefix === "access";
    const isValidSeed = /^\d{4,8}$/.test(seed);

    return isValidPrefix && isValidSeed;
  } catch {
    return false;
  }
}

export class AuthStore {
  apiKey = localStorage.getItem(STORAGE_KEY) || "";
  isAuthorized = parseApiKey(this.apiKey);

  constructor() {
    makeAutoObservable(this);
  }

  login(key: string) {
    const normalizedKey = key.trim();
    const isValid = parseApiKey(normalizedKey);

    if (!isValid) {
      return false;
    }

    this.apiKey = normalizedKey;
    this.isAuthorized = true;

    localStorage.setItem(STORAGE_KEY, normalizedKey);
    return true;
  }

  logout() {
    this.apiKey = "";
    this.isAuthorized = false;

    localStorage.removeItem(STORAGE_KEY);
  }
}
