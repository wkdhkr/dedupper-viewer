import { ConfigurationState } from "../types/unistore";

export default class ConfigurationHelper {
  static getInitialState = (): ConfigurationState => ({
    amazonCloudDriveDomain: "www.amazon.com",
    dedupperServerProtocol: "http",
    dedupperServerPort: 8080,
    showFacePP: "hover",
    recordPlayStatistics: true,
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
