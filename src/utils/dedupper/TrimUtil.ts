import { isArray } from "lodash";
import * as log from "loglevel";
import {
  STANDARD_WIDTH,
  PORTRAIT_MAX_RATIO,
} from "../../constants/dedupperConstants";

import { DedupperImage } from "../../types/unistore";
import { ImageData } from "../../types/viewer";
import ViewerUtil from "../ViewerUtil";

type FitDirection = "top" | "left" | "buttom" | "right";

export default class TrimUtil {
  static isPortraitImage = (image: DedupperImage) => {
    const ratio = image.width / image.height || 0;
    return ratio < PORTRAIT_MAX_RATIO;
  };

  static getDirectionFlags = (sourceRotate?: number) => {
    const rotate = (sourceRotate || 0) % 360;
    const isLeft = rotate === -90 || rotate === 270;
    const isRight = rotate === 90 || rotate === -270;
    const isButtom = rotate === 180 || rotate === -180;
    const isTop = rotate === 0;

    return {
      isLeft,
      isRight,
      isButtom,
      isTop,
    };
  };

  static convertToLandscape = (from: ImageData) => {
    return from;
    // return TrimUtil.convertToPortrait(from, true);
  };

  static convertToPortrait = (sourceFrom: ImageData, reverse = false) => {
    return sourceFrom;
    /*
    const from = ViewerUtil.adjustImageData(sourceFrom);
    // const from = sourceFrom;
    const to = { ...sourceFrom };
    to.rotate = (from.rotate || 0) + (reverse ? 90 : -90);

    const { isButtom, isLeft, isRight, isTop } = TrimUtil.getDirectionFlags(
      from.rotate
    );

    const fitLeft = TrimUtil.calcFitPosition(from, "right");
    const fitTop = TrimUtil.calcFitPosition(from, "top");
    const fitRight = TrimUtil.calcFitPosition(from, "left");
    const fitButtom = TrimUtil.calcFitPosition(from, "buttom");

    log.trace("fitTop, fitLeft", fitTop, fitLeft);
    log.trace("from", from);

    if (isTop) {
      to.left = reverse
        ? window.innerHeight - from.height - from.top
        : -fitTop + from.top;
      to.top = reverse ? fitLeft + from.left : -fitLeft - from.left;
      if (!reverse) {
        to.left -= from.width / 2 - from.height / 2;
        to.top -= from.height / 2 - from.width / 2;
      }
    }
    if (isRight) {
      to.left = reverse ? -fitTop - from.top : -fitTop + from.top;
      to.top = reverse ? fitLeft + from.left : -fitLeft - from.left;
      if (!reverse) {
        to.left -= from.width / 2 - from.height / 2;
        to.top -= from.height / 2 - from.width / 2;
      }
    }
    if (isButtom) {
      to.left = reverse ? fitTop - from.top : -fitTop + from.top;
      to.top = reverse ? fitLeft + from.left : -fitLeft - from.left;
      to.left -= from.width / 2 - from.height / 2;
      to.top -= from.height / 2 - from.width / 2;
    }
    if (isLeft) {
      to.left = reverse ? -fitTop - from.top : -fitTop + from.top;
      to.top = reverse ? fitLeft + from.left : -fitLeft - from.left;
      to.left -= from.width / 2 - from.height / 2;
      to.top -= from.height / 2 - from.width / 2;
    }
    return to;
    */
  };

  static detectRatio = (
    width: number = window.innerWidth,
    height: number = window.innerHeight
  ) => {
    const isPortraitFrame = height > width;
    if (isPortraitFrame) {
      return height / STANDARD_WIDTH;
    }
    return width / STANDARD_WIDTH;
  };

  static createDefault = (di: DedupperImage): ImageData => {
    const aspectRatio = di.width / di.height;
    const trim = {
      naturalWidth: di.width,
      naturalHeight: di.height,
      aspectRatio,
      ratio: 1,
      width: di.width,
      height: di.height,
      left: 0,
      top: 0,
    };

    return trim;
  };

  static hasTrim = (image: DedupperImage) => {
    return TrimUtil.parseTrim(image).some(Boolean);
  };

  static prepareTrim = (image: DedupperImage) => {
    let [landscapeTrim, portraitTrim] = TrimUtil.parseTrim(image);

    if (landscapeTrim === null && portraitTrim) {
      landscapeTrim = TrimUtil.convertToLandscape(portraitTrim);
    }
    if (portraitTrim === null && landscapeTrim) {
      portraitTrim = TrimUtil.convertToPortrait(landscapeTrim);
    }
    return [landscapeTrim, portraitTrim] as const;
  };

  static parseTrim = (
    image: DedupperImage
  ): [ImageData | null, ImageData | null] => {
    if (image.trim) {
      const parsedTrim: ImageData | [ImageData, ImageData] = JSON.parse(
        image.trim
      );
      if (isArray(parsedTrim)) {
        return parsedTrim;
      }
      if (TrimUtil.isPortraitImage(image)) {
        return [null, parsedTrim];
      }
      return [parsedTrim, null];
    }
    return [null, null];
  };

  static detectTrim = (image: DedupperImage) => {
    const [landscapeTrim, portraitTrim] = TrimUtil.parseTrim(image);

    if (ViewerUtil.isPortraitImage()) {
      return portraitTrim;
    }
    return landscapeTrim;
  };

  static calcFitLeftPosition = (
    imageData: ImageData,
    forceLeft = false,
    forceRight = false
  ) => {
    const fixedRotate = (imageData.rotate || 0) % 360;
    if (Math.abs(fixedRotate) === 90) {
      const left = -(imageData.width / 2 - imageData.height / 2);
      if (
        !forceRight &&
        (forceLeft || Math.round(imageData.left) !== Math.round(left))
      ) {
        return left;
      }
      return left + (window.innerWidth - imageData.height);
    }
    if (!forceRight && (forceLeft || imageData.left !== 0)) {
      return 0;
    }
    return -(imageData.naturalWidth * imageData.ratio - window.innerWidth);
  };

  static calcFitTopPosition = (
    imageData: ImageData,
    forceTop = false,
    forceButtom = false
  ) => {
    const fixedRotate = (imageData.rotate || 0) % 360;
    if (Math.abs(fixedRotate) === 90) {
      const top = -(imageData.height / 2 - imageData.width / 2);
      if (
        !forceButtom &&
        (forceTop || Math.round(imageData.top) !== Math.round(top))
      ) {
        return top;
      }
      return top + (window.innerHeight - imageData.width);
    }
    if (!forceButtom && (forceTop || imageData.top !== 0)) {
      return 0;
    }
    return -(imageData.naturalHeight * imageData.ratio - window.innerHeight);
  };

  static calcFitPosition = (imageData: ImageData, direction: FitDirection) => {
    switch (direction) {
      case "top":
        return TrimUtil.calcFitTopPosition(imageData, true);
      case "left":
        return TrimUtil.calcFitLeftPosition(imageData, true);
      case "right":
        return TrimUtil.calcFitLeftPosition(imageData, false, true);
      case "buttom":
        return TrimUtil.calcFitTopPosition(imageData, false, true);
      default:
        throw new Error("unknown direction");
    }
  };
}
