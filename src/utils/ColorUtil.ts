import { ImageData } from "../types/viewer";

export default class ColorUtil {
  static createFilter = (imageData: ImageData) => {
    const filters = [];

    if (imageData.hue) {
      filters.push(`hue-rotate(${imageData.hue}deg)`);
    }
    if (imageData.contrast) {
      filters.push(`contrast(${imageData.contrast}%)`);
    }
    if (imageData.grayscale) {
      filters.push(`contrast(${imageData.grayscale}%)`);
    }
    if (imageData.sepia) {
      filters.push(`contrast(${imageData.sepia}%)`);
    }
    if (imageData.saturate) {
      filters.push(`contrast(${imageData.saturate}%)`);
    }
    if (imageData.brightness) {
      filters.push(`brightness(${imageData.brightness}%)`);
    }

    return filters.join(" ");
  };
}
