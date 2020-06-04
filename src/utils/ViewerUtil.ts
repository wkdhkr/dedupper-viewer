import {
  STANDARD_HEIGHT,
  STANDARD_WIDTH
} from "../constants/dedupperConstants";
import { ImageData } from "../types/viewer";
import UrlUtil from "./dedupper/UrlUtil";

export default class ViewerUtil {
  static nextUnitNumbers = {
    portraitImage: {
      vertical: [1, 2, 3, 4, 5, 1],
      horizontal: [3, 3, 3, 6, 6, 6, 7, 3]
    },
    landscapeImage: {
      vertical: [1, 2, 3, 4, 1],
      horizontal: [1, 2, 3, 4, 1]
    }
  };

  static detectAllowedUnit = (o: "portrait" | "landscape") => {
    const isPoraitImage = o === "portrait";

    if (ViewerUtil.isPortrait()) {
      // vertical screen
      if (isPoraitImage) {
        return [1, 2, 3, 4, 5];
      }
      return [1, 2, 3, 4];
    }
    // horizontal screen
    if (isPoraitImage) {
      return [3, 6, 7];
    }
    return [1, 2, 3, 4];
  };

  static detectNextUnit = (unit: number) => {
    if (ViewerUtil.isPortraitImage()) {
      const numbers = ViewerUtil.isPortrait()
        ? ViewerUtil.nextUnitNumbers.portraitImage.vertical
        : ViewerUtil.nextUnitNumbers.portraitImage.horizontal;
      return numbers[unit] || numbers[0];
    }
    const numbers = ViewerUtil.isPortrait()
      ? ViewerUtil.nextUnitNumbers.landscapeImage.vertical
      : ViewerUtil.nextUnitNumbers.landscapeImage.horizontal;
    return numbers[unit] || numbers[0];
  };

  static detectUnitAndRange = (unit: number) => [
    unit,
    ViewerUtil.calcRange(unit)
  ];

  static isPortraitImage = () => {
    const orientation = UrlUtil.extractParam("o");
    if (orientation === "portrait") {
      return true;
    }
    return false;
  };

  static isPortrait = () => {
    return window.innerHeight > window.innerWidth;
  };

  static getStandardSize = () => {
    if (ViewerUtil.isPortrait()) {
      return STANDARD_HEIGHT;
    }
    return STANDARD_WIDTH;
  };

  static calcTargetLowHeight = (
    unit: number,
    containerWidth: number = window.innerWidth,
    isFit = false
  ) => {
    const width = containerWidth / unit;
    let ratio = STANDARD_HEIGHT / STANDARD_WIDTH;
    if (ViewerUtil.isPortraitImage()) {
      ratio = STANDARD_WIDTH / STANDARD_HEIGHT;
    }
    const height = ratio * width;
    if (!isFit) {
      return height;
    }
    return height;
    /*
    const restHeight = window.innerHeight % height;
    const range = ViewerUtil.calcRange(unit, containerWidth);
    const visibleRowCount = range / unit;
    return height + restHeight / visibleRowCount;
    */
  };

  static calcRange = (
    unit: number,
    containerWidth: number = window.innerWidth
  ) => {
    const height = ViewerUtil.calcTargetLowHeight(unit, containerWidth);
    // const width = containerWidth / unit;

    const allowedHeightRatio = 0.1;

    let range = 0;
    let totalHeight = 0;
    while (totalHeight < window.innerHeight) {
      range += 1;
      if (range % unit === 0) {
        totalHeight += height;
      }
    }
    if (totalHeight - window.innerHeight > height * allowedHeightRatio) {
      range -= unit;
    }
    return range;
  };

  static getWindowRatio = () => {
    const ss = ViewerUtil.getStandardSize();
    return window.innerWidth / ss;
  };

  static isNonStandardScreen = () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    return isPortrait
      ? window.innerWidth !== STANDARD_HEIGHT
      : window.innerWidth !== STANDARD_WIDTH;
  };

  static adjustImageData = (
    imageData: ImageData,
    ratio: number | null = null
  ) => {
    const windowRatio = ratio || ViewerUtil.getWindowRatio();
    if (ViewerUtil.isNonStandardScreen() || ratio) {
      return {
        ...imageData,
        ...{
          ratio: imageData.ratio * windowRatio,
          width: imageData.width * windowRatio,
          height: imageData.height * windowRatio,
          left: imageData.left * windowRatio,
          top: imageData.top * windowRatio
        }
      };
    }
    return imageData;
  };

  static restoreImageData = (imageData: ImageData) => {
    const windowRatio = ViewerUtil.getWindowRatio();
    if (ViewerUtil.isNonStandardScreen()) {
      return {
        ...imageData,
        ...{
          ratio: imageData.ratio / windowRatio,
          width: imageData.width / windowRatio,
          height: imageData.height / windowRatio,
          left: imageData.left / windowRatio,
          top: imageData.top / windowRatio
        }
      };
    }
    return imageData;
  };
}
