import { IFrameMessage } from "../types/window";
import WindowUtil from "./WindowUtil";

export default class IFrameUtil {
  static isInIFrame = () => {
    return WindowUtil.isInIFrame();
  };

  static getIFrameWindowById = (id: string, w: Window = window) => {
    const el: HTMLIFrameElement | null = w.document.getElementById(id) as any;
    if (el) {
      if (el.contentWindow) {
        return el.contentWindow;
      }
    }
    return null;
  };

  static postMessageForParent = (message: IFrameMessage) => {
    const w = window.parent?.opener || window.parent;
    if (w) {
      w.postMessage(message, "*");
    }
  };

  static postMessageById = (
    message: IFrameMessage,
    id: string,
    origin: string,
    parent: Window = window
  ) => {
    const w = IFrameUtil.getIFrameWindowById(id, parent);
    if (w) {
      w.postMessage(message, origin);
    }
  };
}
