import { Store } from "unistore";
import { State } from "../types/unistore";
import UrlUtil from "../utils/dedupper/UrlUtil";
import GridViewerService from "../services/Viewer/GridViewerService";
import actions from "../actions";

export const EVENT_X_KEY = "EVENT_X_KEY";
export const EVENT_R_KEY = "EVENT_R_KEY";

export default function(store: Store<State>) {
  const gs = new GridViewerService(store);
  document.addEventListener(EVENT_X_KEY, (event: Event) => {
    if (UrlUtil.isInGridViewer()) {
      if (store.getState().mainViewer.images.length) {
        gs.applyTagForImagesInScreen();
      }
    }
  });

  document.addEventListener(EVENT_R_KEY, (event: Event) => {
    if (UrlUtil.isInGridViewer()) {
      if (store.getState().mainViewer.images.length) {
        actions(store).reloadMainViewerImages(store.getState());
      }
    }
  });
}
