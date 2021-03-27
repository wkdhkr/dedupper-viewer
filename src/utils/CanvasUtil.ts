import WorkerUtil from "./WorkerUtil";

export default class CanvasUtil {
  static isPreparedImage = (
    img: HTMLImageElement | null
  ): img is HTMLImageElement => {
    if (img === null || !img.complete || img.naturalWidth === 0) {
      return false;
    }
    return true;
  };

  static convertToImageData = (img: HTMLImageElement | null) => {
    if (!CanvasUtil.isPreparedImage(img)) {
      return null;
    }
    if (img.naturalWidth > 5000 || img.naturalHeight > 5000) {
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(
        0,
        0,
        img.naturalWidth,
        img.naturalHeight
      );
      return imageData;
    }
    return null;
  };

  static convertToDataUrlAsync = (img: HTMLImageElement | null) => {
    return new Promise<string | null>((resolve) => {
      setTimeout(async () => {
        const instance = WorkerUtil.getInstance();
        const imageData = CanvasUtil.convertToImageData(img);
        if (imageData) {
          resolve(await instance.toDataUrl(imageData));
        }
        resolve(null);
      }, 50);
    });
  };

  static convertToDataUrl = async (
    img: HTMLImageElement | null,
    isJpeg = true
  ): Promise<string | null> => {
    if (!CanvasUtil.isPreparedImage(img)) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        // const canvas = document.createElement("canvas");
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(img, 0, 0);
          if (isJpeg) {
            resolve(canvas.toDataURL("image/jpeg", 0.95));
          }
          resolve(canvas.toDataURL("image/png"));
        }
        resolve(null);
      });
    });
  };
}
