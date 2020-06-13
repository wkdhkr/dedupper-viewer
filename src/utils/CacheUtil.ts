import { DedupperImage } from "../types/unistore";

export default class CacheUtil {
  static getKeyForPlay = () => {
    return `dedupper_play_images__${window.location.href}`;
  };

  static addForPlay = (images: DedupperImage[]) => {
    if (images.length) {
      sessionStorage.setItem(CacheUtil.getKeyForPlay(), JSON.stringify(images));
    }
  };

  static getForPlay = (): DedupperImage[] | null => {
    try {
      return JSON.parse(
        sessionStorage.getItem(CacheUtil.getKeyForPlay()) || "[]"
      );
    } catch (e) {
      return null;
    }
  };
}
