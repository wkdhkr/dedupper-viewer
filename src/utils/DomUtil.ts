import { MainViewer } from "../types/viewer";

export default class DomUtil {
  static getViewerFooter = () =>
    (document.getElementsByClassName("viewer-footer")[0] as HTMLDivElement) ||
    null;

  static getViewerCanvas = () =>
    (document.getElementsByClassName("viewer-canvas")[0] as HTMLDivElement) ||
    null;

  static getViewerSourceContainer = () =>
    document.getElementById("viewer-source-container");

  static getViewerSafe = (event?: CustomEvent) => {
    try {
      return DomUtil.getViewer(event);
    } catch (e) {
      return null;
    }
  };

  static getViewer = (event?: CustomEvent) => {
    const container = event
      ? (event as any).target
      : DomUtil.getViewerSourceContainer();
    if (!container) {
      throw new Error("viewer container not found.");
    }
    const viewer = (container as any).viewer as MainViewer | undefined;
    if (!viewer) {
      throw new Error("viewer not found.");
    }
    return viewer;
  };

  static getCurrentHash = (event?: CustomEvent) => {
    const viewer = DomUtil.getViewer(event);
    const hash = viewer.image.alt;
    if (!hash) {
      throw new Error("hash not found.");
    }
    return hash;
  };
}
