import scrollIntoView from "scroll-into-view-if-needed";

export default class WindowUtil {
  static isInIFrame = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
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
        block: "start"
      });
      window.scrollBy(0, 1);
    }
  };
}
