import { Store } from "unistore";
import { DedupperWindow } from "../../types/window";
import { State } from "../../types/unistore";

(window as any).subViewerWindow = null as DedupperWindow | null;
(window as any).parentWindow = null as DedupperWindow | null;

// eslint-disable-next-line no-underscore-dangle
(window as any).__DEDUPPER_VIEWER_IDENTITY__ = true;

export default class SubViewerHelper {
  static setWindow = (w: Window | null) => {
    (window as any).subViewerWindow = w;
  };

  static getWindow = (): DedupperWindow | null => {
    return (window as any).subViewerWindow;
  };

  static getStore = () => {
    return SubViewerHelper.getWindow()?.store || null;
  };

  static isDedupperWindow = (w: Window) =>
    // eslint-disable-next-line no-underscore-dangle
    Boolean((w as any)?.__DEDUPPER_VIEWER_IDENTITY__);

  static getParentWindow = (): DedupperWindow | null => {
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
    return null;
  };

  static getParentStore = (): Store<State> => {
    return SubViewerHelper.getParentWindow()?.store || null;
  };

  static isChild = (): boolean => {
    const w = SubViewerHelper.getParentWindow();
    return w?.__DEDUPPER_VIEWER_IDENTITY__ || false;
  };

  static forChild = (fn: (x: DedupperWindow) => void) => {
    const w = SubViewerHelper.getWindow();
    if (w && !w.closed) {
      fn(w);
    }
  };

  static forParent = (fn: (x: DedupperWindow) => void) => {
    const w = SubViewerHelper.getParentWindow();
    if (w && !w.closed) {
      fn(w);
    }
  };
}
