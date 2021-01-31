import { DedupperImage } from "../types/unistore";

export default class ImageArrayUtil {
  static fitAmountForGridUnit = (images: any[], unit: number) => {
    const rest = images.length >= unit ? images.length % unit : 0;
    if (rest) {
      const finalImages = images.slice(0, images.length - rest);
      return finalImages;
    }
    return images;
  };

  static findIndex = (hash: string | null, images: DedupperImage[]) => {
    if (hash === null) {
      return null;
    }
    return images.findIndex(i => i.hash === hash);
  };

  static toArray(t: any | any[]) {
    if (Array.isArray(t)) {
      return t;
    }
    return [t];
  }

  static detectDestination(
    images: DedupperImage[],
    nextIndex: number
  ): [string | null, number] {
    let finalNextIndex = nextIndex;
    if (finalNextIndex <= -1) {
      // go to last
      finalNextIndex = images.length - 1;
    }
    if (!images[finalNextIndex]) {
      // go to first
      finalNextIndex = 0;
    }
    if (images[finalNextIndex]) {
      return [images[finalNextIndex].hash, finalNextIndex];
    }
    return [null, 0];
  }
}
