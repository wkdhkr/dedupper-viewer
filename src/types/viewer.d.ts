import Viewer from "viewerjs";

export interface ImageData {
  x?: number;
  y?: number;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
  ratio: number;
  width: number;
  height: number;
  left: number;
  top: number;
  hue?: number;
  brightness?: number;
  grayscale?: number;
  saturate?: number;
  sepia?: number;
  contrast?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  translateX?: number;
  translateY?: number;
}

export type MainViewer = Viewer & {
  wheeling: boolean;
  options: Viewer.Options;
  index: number;
  items: HTMLLIElement[];
  image: HTMLImageElement;
  imageData: ImageData;
  initialImageData: ImageData;
};
