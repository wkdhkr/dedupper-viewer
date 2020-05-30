import { DedupperImage } from "../types/unistore";

export default class ImageArrayUtil {
  static detectDestination(
    images: DedupperImage[],
    nextIndex: number
  ): [string, number] {
    let finalNextIndex = nextIndex;
    if (finalNextIndex <= -1) {
      // go to last
      finalNextIndex = images.length - 1;
    }
    if (!images[nextIndex]) {
      // go to first
      finalNextIndex = 0;
    }
    return [images[finalNextIndex].hash, finalNextIndex];
  }
}
