import { isString } from "lodash";
import * as log from "loglevel";
import CanvasUtil from "./CanvasUtil";
import ViewerUtil from "./ViewerUtil";

const decodeStatus: { [x: string]: boolean } = {};

const imageCacheKey = "_dedupper_viewer_image_cache";

export default class PerformanceUtil {
  static storeImageCache = async (
    hash: string,
    source: HTMLImageElement | string | null = null
  ) => {
    const s =
      source === null
        ? (document.getElementById(`photo-image__${hash}`) as HTMLImageElement)
        : source;
    if (s) {
      // const dataUrl = isString(s) ? s : CanvasUtil.convertToDataUrl(s);
      const dataUrl = isString(s)
        ? s
        : await CanvasUtil.convertToDataUrlAsync(s);
      // await CanvasUtil.convertToDataUrl(s);
      if (dataUrl) {
        try {
          localStorage.setItem(imageCacheKey, [hash, dataUrl].join("\t"));
        } catch (e) {
          // may be quota error
        }
      }
    }
  };

  static flushImageCache = () => {
    localStorage.setItem(imageCacheKey, "");
  };

  static getImageCache = (hash: string) => {
    const [cachedHash, dataUrl] = (
      localStorage.getItem(imageCacheKey) || "\t"
    ).split("\t");
    if (cachedHash === hash) {
      return dataUrl;
    }
    return null;
  };

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
