import { ConfigurationState } from "../types/unistore";

export default class ConfigurationHelper {
  static getInitialState = (): ConfigurationState => ({
    flipRandomInPlay: 50,
    standardWidth: 1920,
    standardHeight: 1080,
    enableSubViewer: true,
    selectNextAfterEditInMainViewer: true,
    selectNextAfterEditInGridViewer: true,
    iframeOrigin: `http://localhost:${window.location.port || 80}`,
    maxJSHeapSize: 256,
    open: false,
    autoReload: true,
    gridViewerPlayInterval: 2,
    mainViewerPlayInterval: 2
  });
}
