import { makeAutoObservable } from "mobx";

export class MapUiStore {
  selectedObjectId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  selectObject(id: string) {
    this.selectedObjectId = id;
  }

  clearSelection() {
    this.selectedObjectId = null;
  }
}
