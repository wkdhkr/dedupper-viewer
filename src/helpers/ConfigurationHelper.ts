import { ConfigurationState } from "../types/unistore";

const defaultDomain = `${window.location.hostname.replace(
  /\.local$/,
  ""
)}.local`;

export default class ConfigurationHelper {
  static getInitialState = (): ConfigurationState => ({
    lockInlineViewer: false,
    defaultSortKind: "random",
    amazonCloudDriveDomain: "www.amazon.com",
    dedupperServerProtocol: "http",
    dedupperServerPort: 8080,
    showFacePP: "hover",
    recordPlayStatistics: false,
    flipRandomInPlay: 50,
    standardWidth: 1920,
    standardHeight: 1080,
    enableSubViewer: true,
    selectNextAfterEditInMainViewer: true,
    selectNextAfterEditInGridViewer: true,
    iframeOrigin: `http://${defaultDomain}:${window.location.port || 80}`,
    maxJSHeapSize: 256,
    open: false,
    autoReload: true,
    gridViewerPlayInterval: 2,
    mainViewerPlayInterval: 2,
  });
}
