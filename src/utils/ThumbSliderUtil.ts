import { ConfigurationState, DedupperImage } from "../types/unistore";
import ImageArrayUtil from "./ImageArrayUtil";
import ViewerUtil from "./ViewerUtil";

let leftTopHashesCache: { [x: string]: string[] } = {};
let leftTopHashesSyncMap: { [x: string]: boolean } = {};

const generateCacheKey = (s: string) =>
  // eslint-disable-next-line no-bitwise
  s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

export default class ThumbSliderUtil {
  static getNextLeftTopIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const resultHash = ThumbSliderUtil.getNextLeftTopHash(hash, images, c);
    const index = ImageArrayUtil.findIndex(resultHash, images);
    return [index === -1 ? null : index, resultHash];
  };

  static getLeftTopIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const resultHash = ThumbSliderUtil.getLeftTopHash(hash, images, c);
    const index = ImageArrayUtil.findIndex(resultHash, images);
    return [index === -1 ? null : index, resultHash];
  };

  static getPrevLeftTopIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const resultHash = ThumbSliderUtil.getPrevLeftTopHash(hash, images, c);
    const index = ImageArrayUtil.findIndex(resultHash, images);
    return [index === -1 ? null : index, resultHash];
  };

  static getPrevLeftTopHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ) => {
    const currentLeftTopHash = ThumbSliderUtil.getLeftTopHash(hash, images, c);

    return ThumbSliderUtil.getNextLeftTopHash(
      currentLeftTopHash,
      images,
      c,
      true
    );
  };

  static getLeftTopHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ) => {
    return ThumbSliderUtil.getNextLeftTopHash(hash, images, c, true, 1);
  };

  static getNextLeftTopHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState,
    reverse = false,
    offset = 0
  ) => {
    const direction = reverse ? -1 : +1;
    const hashes = ThumbSliderUtil.detectLeftTopHashes(c, images);
    let currentIndex =
      images.findIndex((i) => i.hash === hash) + direction + offset;
    if (currentIndex === -1) {
      currentIndex = images.length - 1;
    }
    for (let i = currentIndex; i < images.length; i += direction) {
      const image = images[i];
      if (!image) {
        return hashes[0] || null;
      }
      if (hashes.includes(image.hash)) {
        return image.hash;
      }
    }
    return hashes[0] || null;
  };

  static flushLeftTopHashCache = () => {
    leftTopHashesCache = {};
  };

  static detectLeftTopHashes = (
    c: ConfigurationState,
    images: DedupperImage[],
    useCache = true
  ) => {
    const [firstImage] = images;
    if (!firstImage) {
      return [];
    }

    const cacheKey = generateCacheKey(
      `${window.innerHeight}${window.innerWidth}${images
        .map((i) => i.hash)
        .join("")}`
    );

    if (useCache && leftTopHashesCache[cacheKey]) {
      const isSynced = Boolean(leftTopHashesSyncMap[cacheKey]);
      if (!isSynced) {
        const prev = leftTopHashesCache[cacheKey];
        setTimeout(() => {
          const current = ThumbSliderUtil.detectLeftTopHashes(c, images, false);
          if (prev.join("") === current.join("")) {
            leftTopHashesSyncMap[cacheKey] = true;
          }
        }, 3000);
      } else {
        return leftTopHashesCache[cacheKey];
      }
    }

    const { hash: firstHash } = firstImage;

    const hashes = [firstHash];
    let currentHash: string | null = firstHash;

    do {
      [, currentHash] = ThumbSliderUtil.detectNextLeftIndexAndHash(
        currentHash,
        images,
        c
      );
      if (currentHash && currentHash !== firstHash) {
        hashes.push(currentHash);
      }
    } while (currentHash !== firstHash);

    if (hashes.length > 1) {
      leftTopHashesCache[cacheKey] = hashes;
    }
    return hashes;
  };

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
    const isPortrait = mainHeight > mainWidth;
    if (isPortrait) {
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
    if (!ThumbSliderUtil.isPortrait(c)) {
      return window.innerHeight + 1;
    }

    const isPortraitImage = ViewerUtil.isPortraitImage();
    const unit = ThumbSliderUtil.detectUnit(hash, images, c);
    const width = window.innerWidth / unit;

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
    const isPortrait = ThumbSliderUtil.isPortrait(c);
    if (!isPortrait) {
      return ThumbSliderUtil.detectRange(hash, images, c);
    }

    const [width] = ThumbSliderUtil.calcThumbSliderSize(
      c.standardWidth,
      c.standardHeight
    );

    if (ViewerUtil.isPortraitImage()) {
      return Math.floor(width / 128);
    }
    return Math.floor(width / (128 * 2));
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
    const isPortrait = ThumbSliderUtil.isPortrait(c);
    const isPortraitImage = ViewerUtil.isPortraitImage();

    /*
    if (isPortrait) {
      const height = ThumbSliderUtil.calcTargetRowHeight(c);
      const unit = ThumbSliderUtil.detectUnit(c);
      return Math.floor(window.innerHeight / height) * unit;
    }
    */

    if (/* !isPortraitMainViewer */ !isPortrait) {
      const targetWidth = !isPortraitImage
        ? (c.standardWidth / c.standardHeight) * window.innerHeight
        : window.innerHeight / (c.standardHeight / c.standardWidth);
      return Math.floor(window.innerWidth / targetWidth);
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

  static detectPrevLeftIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const [leftIndex, leftHash] = ThumbSliderUtil.detectNextLeftIndexAndHash(
      hash,
      images,
      c,
      true
    );

    if (leftHash == null || leftIndex == null) {
      return [leftIndex, leftHash];
    }

    let el = document.getElementById(`photo-container__${leftHash}`);
    if (!el) {
      return [leftIndex, leftHash];
    }
    el = el.previousElementSibling as HTMLElement | null;
    let previousHash: string;
    if (!el) {
      previousHash = images[images.length - 1].hash;
    } else {
      previousHash = el.id.replace("photo-container__", "");
    }
    return ThumbSliderUtil.detectNextLeftIndexAndHash(
      previousHash,
      images,
      c,
      true
    );
  };

  static detectNextLeftIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState,
    reverse = false
  ): [number | null, string | null] => {
    if (images.length === 0 || hash === null) {
      return [0, null];
    }
    let el = document.getElementById(`photo-container__${hash}`);
    if (!el) {
      return [0, images[0]?.hash || null];
    }
    let currentHash = hash;
    let currentLeftOffset = 9999;
    let currentTopDistance = el.offsetHeight;

    const useLegacyLogic = false;

    if (!useLegacyLogic) {
      // new logic, calculate with image height
      while (
        currentTopDistance < window.innerHeight + 2 ||
        currentLeftOffset > 1
      ) {
        const prevEl = el;
        el = (reverse
          ? el.previousElementSibling
          : el.nextElementSibling) as HTMLElement | null;
        if (!el) {
          // end/start of image list
          if (reverse) {
            return [images.length - 1, images[images.length - 1]?.hash || null];
          }
          return [0, images[0]?.hash || null];
        }
        currentHash = el.id.replace("photo-container__", "");
        currentLeftOffset = el.offsetLeft;
        if (prevEl.offsetTop !== el.offsetTop) {
          currentTopDistance += el.offsetHeight;
        }
      }
      return [images.map((i) => i.hash).indexOf(currentHash), currentHash];
    }

    // legacy logic, calculate with image "offsetLeft" only.

    if (el.offsetLeft < 2 && reverse) {
      return [images.map((i) => i.hash).indexOf(currentHash), currentHash];
    }

    while (currentLeftOffset > 1) {
      el = (reverse
        ? el.previousElementSibling
        : el.nextElementSibling) as HTMLElement | null;
      if (!el) {
        // end/start of image list
        if (reverse) {
          return [images.length - 1, images[images.length - 1]?.hash || null];
        }
        return [0, images[0]?.hash || null];
      }
      currentHash = el.id.replace("photo-container__", "");
      currentLeftOffset = el.offsetLeft;
    }
    return [images.map((i) => i.hash).indexOf(currentHash), currentHash];
  };
}
