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

  static toArray(t: any | any[]) {
    if (Array.isArray(t)) {
      return t;
    }
    return [t];
  }

  static detectDestination(
    images: DedupperImage[],
    nextIndex: number
  ): [string, number] {
    let finalNextIndex = nextIndex;
    if (finalNextIndex <= -1) {
      // go to last
      finalNextIndex = images.length - 1;
    }
    if (!images[finalNextIndex]) {
      // go to first
      finalNextIndex = 0;
    }
    return [images[finalNextIndex].hash, finalNextIndex];
  }
}
