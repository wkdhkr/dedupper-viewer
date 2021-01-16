import {
  STANDARD_HEIGHT,
  STANDARD_WIDTH
} from "../constants/dedupperConstants";
import { ImageData } from "../types/viewer";
import UrlUtil from "./dedupper/UrlUtil";

function isNumber(value: any): value is number {
  // eslint-disable-next-line no-restricted-globals
  return typeof value === "number" && !isNaN(value);
}

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

  static calcMainViewerSize = (
    standardWidth: number,
    standardHeight: number
  ) => {
    const { innerHeight, innerWidth } = window;
    const isPortrait = ViewerUtil.isPortrait();
    const standardRatio = standardWidth / standardHeight;
    if (isPortrait) {
      const windowRatio = innerHeight / innerWidth;
      if (windowRatio > standardRatio) {
        return [innerWidth, innerWidth * (standardWidth / standardHeight)];
      }
      return [innerHeight * (standardHeight / standardWidth), innerHeight];
    }
    const windowRatio = innerWidth / innerHeight;
    if (windowRatio < standardRatio) {
      return [innerWidth, innerWidth * (standardHeight / standardWidth)];
    }
    return [innerHeight * (standardWidth / standardHeight), innerHeight];
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

  static detectRange = (unit: number) => ViewerUtil.calcRange(unit);

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

  static getTransforms = (_ref: ImageData) => {
    const { rotate } = _ref;
    const { scaleX } = _ref;
    const { scaleY } = _ref;
    const { translateX } = _ref;
    const { translateY } = _ref;
    const values = [];

    if (isNumber(translateX) && translateX !== 0) {
      values.push("translateX(".concat(String(translateX), "px)"));
    }

    if (isNumber(translateY) && translateY !== 0) {
      values.push("translateY(".concat(String(translateY), "px)"));
    } // Rotate should come first before scale to match orientation transform

    if (isNumber(rotate) && rotate !== 0) {
      values.push("rotate(".concat(String(rotate), "deg)"));
    }

    if (isNumber(scaleX) && scaleX !== 1) {
      values.push("scaleX(".concat(String(scaleX), ")"));
    }

    if (isNumber(scaleY) && scaleY !== 1) {
      values.push("scaleY(".concat(String(scaleY), ")"));
    }

    values.push("translate3d(0, 0, 0)");

    const transform = values.length ? values.join(" ") : "none";
    return {
      // WebkitTransform: transform,
      // msTransform: transform,
      transform
    };
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
