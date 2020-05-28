/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-underscore-dangle */

import store from "../store";
import UrlUtil from "../utils/dedupper/UrlUtil";
import ViewerUtil from "../utils/ViewerUtil";

const WINDOW = window;

const IS_SAFARI =
  WINDOW.navigator &&
  /(Macintosh|iPhone|iPod|iPad).*AppleWebKit/i.test(WINDOW.navigator.userAgent);
/**
 * Get an image's natural sizes.
 * @param {string} image - The target image.
 * @param {Function} callback - The callback function.
 * @returns {HTMLImageElement} The new image.
 */
function getImageNaturalSizes(
  image: HTMLImageElement,
  callback: (w: number, h: number) => void
) {
  const newImage = document.createElement("img"); // Modern browsers (except Safari)

  if (image.naturalWidth && !IS_SAFARI) {
    callback(image.naturalWidth, image.naturalHeight);
    return newImage;
  }

  const body = document.body || document.documentElement;

  newImage.onload = () => {
    callback(newImage.width, newImage.height);

    if (!IS_SAFARI) {
      body.removeChild(newImage);
    }
  };

  newImage.src = image.src; // iOS Safari will convert the image automatically
  // with its orientation once append it into DOM

  if (!IS_SAFARI) {
    newImage.style.cssText =
      "left:0;" +
      "max-height:none!important;" +
      "max-width:none!important;" +
      "min-height:0!important;" +
      "min-width:0!important;" +
      "opacity:0;" +
      "position:absolute;" +
      "top:0;" +
      "z-index:-1;";
    body.appendChild(newImage);
  }

  return newImage;
}
export function initImage(this: any, done: any) {
  const _this2 = this;

  const { options } = this;
  const { image } = this;
  const { viewerData } = this;
  const footerHeight = this.footer.offsetHeight;
  const viewerWidth = viewerData.width;
  const viewerHeight = Math.max(viewerData.height - footerHeight, footerHeight);
  const oldImageData = this.imageData || {};
  let sizingImage: any;
  this.imageInitializing = {
    abort: function abort() {
      sizingImage.onload = null;
    }
  };
  // eslint-disable-next-line func-names
  sizingImage = getImageNaturalSizes(image, function(
    naturalWidth: number,
    naturalHeight: number
  ) {
    const aspectRatio = naturalWidth / naturalHeight;
    let width = viewerWidth;
    let height = viewerHeight;
    _this2.imageInitializing = false;

    if (viewerHeight * aspectRatio > viewerWidth) {
      height = viewerWidth / aspectRatio;
    } else {
      width = viewerHeight * aspectRatio;
    }

    width = Math.min(width * 1.0, naturalWidth);
    height = Math.min(height * 1.0, naturalHeight);
    const imageData = {
      naturalWidth,
      naturalHeight,
      aspectRatio,
      ratio: width / naturalWidth,
      width,
      height,
      left: (viewerWidth - width) / 2,
      top: (viewerHeight - height) / 2
    };
    const initialImageData = { ...imageData };

    if (options.rotatable) {
      (imageData as any).rotate = oldImageData.rotate || 0;
      (initialImageData as any).rotate = 0;
    }

    if (options.scalable) {
      (imageData as any).scaleX = oldImageData.scaleX || 1;
      (imageData as any).scaleY = oldImageData.scaleY || 1;
      (initialImageData as any).scaleX = 1;
      (initialImageData as any).scaleY = 1;
    }

    _this2.imageData = imageData;
    _this2.initialImageData = initialImageData;

    if (done) {
      done();
    }
  });
}

export function initImageExpand(this: any, done: any) {
  const _this2 = this;

  const { options } = this;
  const { image } = this;
  const { viewerData } = this;
  // const footerHeight = this.footer.offsetHeight;
  const footerHeight = 0;
  const viewerWidth = viewerData.width;
  const viewerHeight = Math.max(viewerData.height - footerHeight, footerHeight);
  const oldImageData = this.imageData || {};
  let sizingImage: any;
  this.imageInitializing = {
    abort: function abort() {
      sizingImage.onload = null;
    }
  };
  // eslint-disable-next-line func-names
  sizingImage = getImageNaturalSizes(image, function(
    naturalWidth: number,
    naturalHeight: number
  ) {
    const state = store.getState();
    const hash = UrlUtil.extractHashParam(image.src);
    const dedupperImage = state.mainViewer.images.find(i => i.hash === hash);
    const aspectRatio = naturalWidth / naturalHeight;
    let width = viewerWidth;
    let height = viewerHeight;
    _this2.imageInitializing = false;

    if (viewerHeight * aspectRatio <= viewerWidth) {
      height = viewerWidth / aspectRatio;
    } else {
      width = viewerHeight * aspectRatio;
    }

    // width = Math.min(width * 1.0, naturalWidth);
    // height = Math.min(height * 1.0, naturalHeight);
    const imageData = {
      naturalWidth,
      naturalHeight,
      aspectRatio,
      ratio: width / naturalWidth,
      width,
      height,
      left: (viewerWidth - width) / 2,
      top: (viewerHeight - height) / 2
    };
    const initialImageData = { ...imageData };

    if (options.rotatable) {
      (imageData as any).rotate = oldImageData.rotate || 0;
      (initialImageData as any).rotate = 0;
    }

    if (options.scalable) {
      (imageData as any).scaleX = oldImageData.scaleX || 1;
      (imageData as any).scaleY = oldImageData.scaleY || 1;
      (initialImageData as any).scaleX = 1;
      (initialImageData as any).scaleY = 1;
    }

    if (dedupperImage && dedupperImage.trim !== "") {
      _this2.imageData = ViewerUtil.ajustImageData(
        JSON.parse(dedupperImage.trim)
      );
    } else {
      _this2.imageData = imageData;
    }
    _this2.initialImageData = initialImageData;

    if (done) {
      done();
    }
  });
}
