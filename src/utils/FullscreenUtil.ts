import SubViewerHelper from "../helpers/viewer/SubViewerHelper";

export default class FullscreenUtil {
  static toggleFullscreen = () => {
    const w = SubViewerHelper.getWindow();
    const parentWindow = SubViewerHelper.getParentWindow();
    if (document.fullscreenElement) {
      w?.document.exitFullscreen().catch(() => {});
      parentWindow?.document.exitFullscreen().catch(() => {});
      document.exitFullscreen().catch(() => {});
    } else {
      w?.document.documentElement.requestFullscreen().catch(() => {});
      parentWindow?.document.documentElement
        .requestFullscreen()
        .catch(() => {});
      document.body.requestFullscreen().catch(() => {});
    }
  };
}
