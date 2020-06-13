import { DedupperWindow } from "../../types/window";
import UrlUtil from "../../utils/dedupper/UrlUtil";

const currentWindow = (window as any) as DedupperWindow;

currentWindow.subViewerWindow = null;
currentWindow.parentWindow = null;
currentWindow.managerWindow = null;

// eslint-disable-next-line no-underscore-dangle
(window as any).__DEDUPPER_VIEWER_IDENTITY__ = true;

export default class SubViewerHelper {
  static setWindow = (w: Window | null) => {
    (window as any).subViewerWindow = w;
  };

  static getWindow = (): DedupperWindow | null => {
    return (window as any).subViewerWindow;
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
    return UrlUtil.extractParam("mode") === "parent";
  };

  static isChild = (): boolean => {
    // return w?.name === "dedupper_sub_viewer";
    return UrlUtil.extractParam("mode") === "subviewer";
    // eslint-disable-next-line no-underscore-dangle
    // return (w as any).__DEDUPPER_VIEWER_SUB_VIEWER__ || false;
  };

  static isManager = () => {
    /*
    if (SubViewerHelper.isChild(w) || SubViewerHelper.isParent(w)) {
      return null;
    }
    if (SubViewerHelper.isDedupperWindow(w)) {
      // may be
      return w;
    }
    return null;
    */
    return !SubViewerHelper.isChild() && !SubViewerHelper.isParent();
  };

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

  static forChild = (fn: (x: DedupperWindow) => void) => {
    if (!SubViewerHelper.isChild()) {
      const w = SubViewerHelper.getWindow();
      if (w && !w.closed) {
        fn(w);
      }
    }
  };

  static dispatchCustomEventForParent = (
    name: string,
    detail: Record<string, any> = {}
  ) => {
    const w = SubViewerHelper.getParentWindow();
    const event = new CustomEvent(name, { detail });
    w?.document.dispatchEvent(event);
  };
}
