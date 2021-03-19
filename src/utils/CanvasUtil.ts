export default class CanvasUtil {
  static convertToDataUrl = (img: HTMLImageElement | null, isJpeg = true) => {
    if (img === null || !img.complete || img.naturalWidth === 0) {
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(img, 0, 0);
      if (isJpeg) {
        return canvas.toDataURL("image/jpeg", 0.95);
      }
      return canvas.toDataURL("image/png");
    }
    return null;
  };
}
