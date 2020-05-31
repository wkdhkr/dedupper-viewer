import {
  STANDARD_HEIGHT,
  STANDARD_WIDTH
} from "../constants/dedupperConstants";
import { ImageData } from "../types/viewer";

export default class ViewerUtil {
  static getStandardSize = () => {
    if (window.innerHeight > window.innerWidth) {
      return STANDARD_HEIGHT;
    }
    return STANDARD_WIDTH;
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
