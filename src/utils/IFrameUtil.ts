import { uniqueId } from "lodash";
import * as log from "loglevel";
import { IFrameMessage } from "../types/window";
import UrlUtil from "./dedupper/UrlUtil";
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

  static postMessageForOther = (sourcePayload: IFrameMessage) => {
    const payload: IFrameMessage = {
      id: uniqueId("message_"),
      ...sourcePayload,
    };
    if (UrlUtil.isInGridViewer()) {
      IFrameUtil.postMessageForParent({
        type: "forSubViewer",
        payload,
      });
      IFrameUtil.postMessageForParent({
        type: "forThumbSlider",
        payload,
      });
      IFrameUtil.postMessageForParent({
        type: "forMainViewer",
        payload,
      });
    } else {
      IFrameUtil.postMessageForParent({
        type: "forGrid",
        payload,
      });
      IFrameUtil.postMessageForParent({
        type: "forThumbSlider",
        payload,
      });
    }
    if (UrlUtil.isInThumbSlider()) {
      IFrameUtil.postMessageForParent({
        type: "forMainViewer",
        payload,
      });
      if (UrlUtil.isInline()) {
        IFrameUtil.postMessageForParent({
          type: "forGrid",
          payload,
        });
      }
    }
  };

  static postMessage = (
    message: IFrameMessage,
    w: Window | null = null,
    origin = "*"
  ) => {
    log.trace(message.type, window.location.href);
    (w || window).postMessage(
      { ...message, fromUrl: window.location.href },
      origin
    );
  };

  static postMessageForParent = (message: IFrameMessage) => {
    const w = window.parent?.opener || window.parent;
    if (w) {
      IFrameUtil.postMessage(message, w);
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
      IFrameUtil.postMessage(message, w, origin);
    }
  };
}
