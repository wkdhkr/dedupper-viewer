interface FileReaderSync {
  readAsArrayBuffer(blob: Blob): any;
  readAsBinaryString(blob: Blob): void;
  readAsDataURL(blob: Blob): string;
  readAsText(blob: Blob, encoding?: string): string;
}

declare let FileReaderSync: {
  prototype: FileReaderSync;
  new (): FileReaderSync;
};

export async function toDataUrl(imageData: ImageData): Promise<string> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("cannot create 2d context");
  }
  context.putImageData(imageData, 0, 0);
  const blob = await canvas.convertToBlob({
    type: "image/webp",
    quality: 0.95,
  });
  const reader = new FileReaderSync();
  return reader.readAsDataURL(blob);
}
