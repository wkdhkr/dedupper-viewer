import scrollIntoView from "scroll-into-view-if-needed";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";

export default class WindowUtil {
  static isInIFrame = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };

  static toggleFullscreen = () => {
    const w = SubViewerHelper.getWindow();
    const parentWindow = SubViewerHelper.getParentWindow();
    if (document.fullscreenElement) {
      w?.document.exitFullscreen().catch(() => {});
      parentWindow?.document.exitFullscreen().catch(() => {});
      document.exitFullscreen().catch(() => {});
    } else {
      w?.document.documentElement.requestFullscreen().catch(() => {});
      parentWindow?.document.documentElement
        .requestFullscreen()
        .catch(() => {});
      document.body.requestFullscreen().catch(() => {});
    }
  };

  static scrollToNative = (el: HTMLElement | null) => {
    if (el) {
      el.scrollIntoView();
    }
  };

  static scrollTo = (el: HTMLElement | null, ifNeeded = true) => {
    if (el) {
      scrollIntoView(el, {
        // behavior: "smooth",
        scrollMode: ifNeeded ? "if-needed" : "always",
        block: "start",
      });
      window.scrollBy(0, 1);
    }
  };
}
