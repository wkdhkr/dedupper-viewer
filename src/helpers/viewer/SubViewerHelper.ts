import { DedupperWindow } from "../../types/window";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import WindowUtil from "../../utils/WindowUtil";

const currentWindow = (window as any) as DedupperWindow;

currentWindow.subViewerWindow = null;
currentWindow.parentWindow = null;
currentWindow.managerWindow = null;

/**
 * - window -> parentWindow
 *   - iframe
 *   - subViewer -> subViewerWindow
 *     - iframe
 */

// eslint-disable-next-line no-underscore-dangle
(window as any).__DEDUPPER_VIEWER_IDENTITY__ = true;

export default class SubViewerHelper {
  static setWindow = (w: Window | null) => {
    (window as any).subViewerWindow = w;
  };

  static getWindow = (): DedupperWindow | null => {
    const w = (window as any).subViewerWindow;
    if (w) {
      return w;
    }

    return null;
  };

  static prepareReference = async () => {
    if (WindowUtil.isInIFrame()) {
      if (window.parent) {
        window.parent.postMessage(
          {
            type: "prepareSubViewerReference",
          },
          "*"
        );
      }
    }
    return new Promise((resolve: (value: unknown) => void) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  };

  static isDedupperWindow = (w: Window) =>
    // eslint-disable-next-line no-underscore-dangle
    Boolean((w as any)?.__DEDUPPER_VIEWER_IDENTITY__);

  static getParentWindow = (): DedupperWindow | null => {
    if (SubViewerHelper.isParent()) {
      return window as any;
    }
    const w = window.opener || null;
    try {
      if (SubViewerHelper.isDedupperWindow(w)) {
        if (w?.subViewerWindow === window) {
          return w;
        }
      }
    } catch (e) {
      // ignore security error
    }
    if ((window as any).parentWindow) {
      return (window as any).parentWindow;
    }
    return null;
  };

  static isParent = () => {
    if (UrlUtil.extractParam("mode") === "subviewer") {
      return false;
    }
    if (window.parent) {
      return false;
    }
    if (window.opener) {
      return false;
    }
    return true;
  };

  static isChild = (): boolean => {
    // return w?.name === "dedupper_sub_viewer";
    return UrlUtil.extractParam("mode") === "subviewer";
    // eslint-disable-next-line no-underscore-dangle
    // return (w as any).__DEDUPPER_VIEWER_SUB_VIEWER__ || false;
  };

  // static isManager = () => {
  //   if (SubViewerHelper.isChild(w) || SubViewerHelper.isParent(w)) {
  //     return null;
  //   }
  //   if (SubViewerHelper.isDedupperWindow(w)) {
  //     // may be
  //     return w;
  //   }
  //   return null;
  //   */
  //   return !SubViewerHelper.isChild() && !SubViewerHelper.isParent();
  // };

  static spawnParentWindow = (url: string) => {
    // const parentWindow = window.open(url, "dedupper_parent");
    const e = document.createElement("a");
    e.href = url;
    e.target = "dedupper_parent";
    e.rel = "noreferrer";
    e.click();
  };

  static isSubViewer = (): boolean =>
    UrlUtil.extractParam("mode") === "subviewer" && UrlUtil.isInSingleViewer();

  /*
  static forChild = (fn: (x: DedupperWindow) => void) => {
    if (!SubViewerHelper.isChild()) {
      const w = SubViewerHelper.getWindow();
      if (w && !w.closed) {
        fn(w);
      }
    }
  };
  */
}
