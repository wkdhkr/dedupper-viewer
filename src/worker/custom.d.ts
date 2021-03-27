declare module "comlink-loader!*" {
  class WebpackWorker extends Worker {
    constructor();

    toDataUrl(imageData: ImageData): Promise<string>;
  }

  export = WebpackWorker;
}
