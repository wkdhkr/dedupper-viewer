import { ConfigurationState, DedupperImage } from "../types/unistore";
import GridViewerUtil from "./GridViewerUtil";
import ViewerUtil from "./ViewerUtil";

export default class ThumbSliderUtil extends GridViewerUtil {
  static calcThumbSliderSize = (
    standardWidth: number,
    standardHeight: number
  ) => {
    const { innerHeight, innerWidth } = window;
    const [mainWidth, mainHeight] = ViewerUtil.calcMainViewerSize(
      standardWidth,
      standardHeight
    );
    const standardRatio = standardWidth / standardHeight;
    const isMainViewerPortrait = mainHeight > mainWidth;
    if (isMainViewerPortrait) {
      const windowRatio = innerHeight / innerWidth;
      if (windowRatio > standardRatio) {
        return [mainWidth, innerHeight - mainHeight];
      }
      return [innerWidth - mainWidth, mainHeight];
    }
    const windowRatio = innerWidth / innerHeight;
    if (windowRatio < standardRatio) {
      // +1, for react-gallery 1px offset issue
      return [mainWidth, innerHeight - mainHeight + 1];
    }
    return [innerWidth - mainWidth, innerHeight];
  };

  static isPortrait = (c: ConfigurationState) => {
    const [mainWidth, mainHeight] = ViewerUtil.calcMainViewerSize(
      c.standardWidth,
      c.standardHeight
    );

    const isSameWidth = window.innerWidth === mainWidth;
    const isSameHeight = window.innerHeight === mainHeight;

    if (isSameWidth && isSameHeight) {
      return ViewerUtil.isPortrait();
    }
    if (isSameWidth) {
      return true;
    }
    if (isSameHeight) {
      return false;
    }
    return true;
  };

  static calcTargetRowHeight = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): number => {
    /*
    if (!ThumbSliderUtil.isPortrait(c)) {
      return window.innerHeight + 1;
    }
    */
    if (!ViewerUtil.isPortraitImage()) {
      return window.innerHeight + 1;
    }

    const isPortraitImage = ViewerUtil.isPortraitImage();
    const unit = ThumbSliderUtil.detectUnit(hash, images, c);
    const width = window.innerWidth / (unit < 1 ? 1 : unit);

    if (isPortraitImage) {
      return width * (c.standardWidth / c.standardHeight);
    }

    return width * (c.standardHeight / c.standardWidth);
  };

  static detectUnit = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): number => {
    // const isPortrait = ThumbSliderUtil.isPortrait(c);
    const isPortraitImage = ViewerUtil.isPortraitImage();
    if (!isPortraitImage) {
      return ThumbSliderUtil.detectRange(hash, images, c);
    }

    /*
    const [width] = ThumbSliderUtil.calcThumbSliderSize(
      c.standardWidth,
      c.standardHeight
    );
    */
    const width = window.innerWidth;

    if (ViewerUtil.isPortraitImage()) {
      // return Math.floor(width / 128) || 1;
      return Math.floor(width / 160) || 1;
    }
    // return Math.floor(width / (128 * 2)) || 1;
    return Math.floor(width / (160 * 2)) || 1;
  };

  static detectRange = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): number => {
    /*
    const isPortraitMainViewer = ViewerUtil.isPortraitMainViewer(
      c.standardWidth,
      c.standardHeight
    );
    */
    // const isPortrait = ThumbSliderUtil.isPortrait(c);
    const isPortraitImage = ViewerUtil.isPortraitImage();

    /*
    if (isPortrait) {
      const height = ThumbSliderUtil.calcTargetRowHeight(c);
      const unit = ThumbSliderUtil.detectUnit(c);
      return Math.floor(window.innerHeight / height) * unit;
    }
    */

    if (/* !isPortraitMainViewer */ !isPortraitImage) {
      const targetWidth = !isPortraitImage
        ? (c.standardWidth / c.standardHeight) * window.innerHeight
        : window.innerHeight / (c.standardHeight / c.standardWidth);
      return Math.floor(window.innerWidth / targetWidth) || 1;
    }

    const [currentIndex] = ThumbSliderUtil.getLeftTopIndexAndHash(
      hash,
      images,
      c
    );
    const [nextIndex] = ThumbSliderUtil.getNextLeftTopIndexAndHash(
      hash,
      images,
      c
    );

    if (nextIndex !== null && currentIndex != null) {
      if (nextIndex === 0) {
        if (currentIndex === 0) {
          return 1;
        }
        return ThumbSliderUtil.detectRange(images[0].hash, images, c);
      }
      return Math.abs(nextIndex - currentIndex);
    }
    return 1;
  };
}
