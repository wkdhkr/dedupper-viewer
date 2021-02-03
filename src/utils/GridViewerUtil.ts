import { ConfigurationState, DedupperImage } from "../types/unistore";

import ImageArrayUtil from "./ImageArrayUtil";
import WindowUtil from "./WindowUtil";

let leftTopHashesCache: { [x: string]: string[] } = {};
const leftTopHashesSyncMap: { [x: string]: boolean } = {};

const generateCacheKey = (s: string) =>
  // eslint-disable-next-line no-bitwise
  s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

export default class GridViewerUtil {
  static scrollToLeftTopHash = (
    hash: string,
    images: DedupperImage[],
    c: ConfigurationState
  ) => {
    const leftTopHash = GridViewerUtil.getLeftTopHash(hash, images, c);
    if (leftTopHash) {
      const el = document.getElementById(`photo-container__${leftTopHash}`);
      WindowUtil.scrollToNative(el);
    }
  };

  static getNextLeftTopIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const resultHash = GridViewerUtil.getNextLeftTopHash(hash, images, c);
    const index = ImageArrayUtil.findIndex(resultHash, images);
    return [index === -1 ? null : index, resultHash];
  };

  static getLeftTopIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const resultHash = GridViewerUtil.getLeftTopHash(hash, images, c);
    const index = ImageArrayUtil.findIndex(resultHash, images);
    return [index === -1 ? null : index, resultHash];
  };

  static getPrevLeftTopIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const resultHash = GridViewerUtil.getPrevLeftTopHash(hash, images, c);
    const index = ImageArrayUtil.findIndex(resultHash, images);
    return [index === -1 ? null : index, resultHash];
  };

  static getPrevLeftTopHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ) => {
    const currentLeftTopHash = GridViewerUtil.getLeftTopHash(hash, images, c);

    return GridViewerUtil.getNextLeftTopHash(
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
    return GridViewerUtil.getNextLeftTopHash(hash, images, c, true, 1);
  };

  static getNextLeftTopHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState,
    reverse = false,
    offset = 0
  ) => {
    const direction = reverse ? -1 : +1;
    const hashes = GridViewerUtil.detectLeftTopHashes(c, images);
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
      // for rendering performance issue
      const isSynced = Boolean(leftTopHashesSyncMap[cacheKey]);
      if (!isSynced) {
        const prev = leftTopHashesCache[cacheKey];
        setTimeout(() => {
          const current = GridViewerUtil.detectLeftTopHashes(c, images, false);
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
      [, currentHash] = GridViewerUtil.detectNextLeftIndexAndHash(
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

  static detectPrevLeftIndexAndHash = (
    hash: string | null,
    images: DedupperImage[],
    c: ConfigurationState
  ): [number | null, string | null] => {
    const [leftIndex, leftHash] = GridViewerUtil.detectNextLeftIndexAndHash(
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
    return GridViewerUtil.detectNextLeftIndexAndHash(
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
