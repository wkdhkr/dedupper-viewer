export default class PerformanceUtil {
  static isJSHeapOver = (w: Window, limit: number) => {
    return PerformanceUtil.getJSHeap(w) > limit * 1024 * 1024;
  };

  static getJSHeap = (w: Window = window) => {
    return ((w.performance as any)?.memory as any)?.usedJSHeapSize || Infinity;
  };
}
