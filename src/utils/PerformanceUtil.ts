import * as log from "loglevel";
import ViewerUtil from "./ViewerUtil";

const decodeStatus: { [x: string]: boolean } = {};

export default class PerformanceUtil {
  static decodeImage = async (hash?: string) => {
    if (hash && !decodeStatus[hash]) {
      decodeStatus[hash] = true;
      log.debug("decode image", hash);
      await ViewerUtil.decodeImage(hash);
    }
  };

  static isJSHeapOver = (w: Window, limit: number) => {
    return PerformanceUtil.getJSHeap(w) > limit * 1024 * 1024;
  };

  static getJSHeap = (w: Window = window) => {
    return ((w.performance as any)?.memory as any)?.usedJSHeapSize || Infinity;
  };
}
