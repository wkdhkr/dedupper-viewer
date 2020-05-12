import Viewer from "viewerjs";
import UrlUtil from "./dedupper/UrlUtil";
import { ImageData } from "../types/viewer";

export default class DomUtil {
  static getViewerCanvas = () =>
    document.getElementsByClassName("viewer-canvas")[0];

  static getViewerSourceContainer = () =>
    document.getElementById("viewer-source-container");

  static getViewer = () => {
    const container = DomUtil.getViewerSourceContainer();
    if (!container) {
      throw new Error("viewer container not found.");
    }
    return (container as any).viewer as
      | (Viewer & {
          image: HTMLImageElement;
          imageData: ImageData;
        })
      | null;
  };

  static getCurrentHash = () => {
    const viewer = DomUtil.getViewer();
    if (viewer) {
      return UrlUtil.extractHashParam(viewer.image.src) || null;
    }
    return null;
  };
}
