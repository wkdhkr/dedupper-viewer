/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-underscore-dangle */

import store from "../store";
import UrlUtil from "../utils/dedupper/UrlUtil";
import ViewerUtil from "../utils/ViewerUtil";

const { isNaN } = Number;

/**
 * Check if the given value is a number.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a number, else `false`.
 */
export function isNumber(value: any) {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Check if the given value is an object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is an object, else `false`.
 */
export function isObject(value: any) {
  return typeof value === "object" && value !== null;
}

/**
 * Check if the given value is a function.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a function, else `false`.
 */
export function isFunction(value: any) {
  return typeof value === "function";
}

/**
 * Iterate the given data.
 * @param {*} data - The data to iterate.
 * @param {Function} callback - The process function for each element.
 * @returns {*} The original data.
 */
function forEach(data: any, callback: any) {
  if (data && isFunction(callback)) {
    if (Array.isArray(data) || isNumber(data.length) /* array-like */) {
      const { length } = data;
      let i;

      for (i = 0; i < length; i += 1) {
        if (callback.call(data, data[i], i, data) === false) {
          break;
        }
      }
    } else if (isObject(data)) {
      Object.keys(data).forEach((key) => {
        callback.call(data, data[key], key, data);
      });
    }
  }

  return data;
}

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
  options: any,
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

  forEach(options.inheritedAttributes, (name: any) => {
    const value = image.getAttribute(name);

    if (value !== null) {
      newImage.setAttribute(name, value);
    }
  });

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
  const viewerWidth: number = viewerData.width;
  const viewerHeight = Math.max(viewerData.height - footerHeight, footerHeight);
  const oldImageData = this.imageData || {};
  let sizingImage: any;
  this.imageInitializing = {
    abort: () => {
      sizingImage.onload = null;
    },
  };
  // eslint-disable-next-line func-names
  sizingImage = getImageNaturalSizes(
    image,
    options,
    (naturalWidth: number, naturalHeight: number) => {
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

      const left = (viewerWidth - width) / 2;
      const top = (viewerHeight - height) / 2;

      const imageData = {
        left,
        top,
        x: left,
        y: top,
        width,
        height,
        ratio: width / naturalWidth,
        aspectRatio,
        naturalWidth,
        naturalHeight,
      };

      // ignore 1 pixel offset
      if (Math.abs(imageData.left) < 2) {
        imageData.left = 0;
      }
      if (Math.abs(imageData.top) < 2) {
        imageData.top = 0;
      }

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
    }
  );
}

export function initImageExpand(this: any, done: any) {
  const _this2 = this;

  const { options } = this;
  const { image } = this as { image: HTMLImageElement };
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
    },
  };
  // eslint-disable-next-line func-names
  sizingImage = getImageNaturalSizes(
    image,
    this.options,
    (naturalWidth: number, naturalHeight: number) => {
      const state = store.getState();
      const { hash } = image.dataset;
      const dedupperImage = state.mainViewer.images.find(
        (i) => i.hash === hash
      );
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
      const left = (viewerWidth - width) / 2;
      const top = (viewerHeight - height) / 2;
      const imageData = {
        left,
        top,
        x: left,
        y: top,
        width,
        height,
        naturalWidth,
        naturalHeight,
        aspectRatio,
        ratio: width / naturalWidth,
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
        _this2.imageData = ViewerUtil.adjustImageData(
          JSON.parse(dedupperImage.trim)
        );
      } else {
        _this2.imageData = imageData;
      }
      // ignore 1 pixel offset
      if (Math.abs(_this2.imageData.left) < 2) {
        _this2.imageData.left = 0;
      }
      if (Math.abs(_this2.imageData.top) < 2) {
        _this2.imageData.top = 0;
      }
      _this2.initialImageData = initialImageData;

      if (done) {
        done();
      }
    }
  );
}
