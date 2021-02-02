import { Store } from "unistore";
import { State } from "../types/unistore";
import UrlUtil from "../utils/dedupper/UrlUtil";
import GridViewerService from "../services/Viewer/GridViewerService";
import actions from "../actions";
import {
  EVENT_X_KEY,
  EVENT_R_KEY,
  EVENT_UPDATE_IMAGE,
} from "../constants/dedupperConstants";
import StoreUtil from "../utils/StoreUtil";

export default function(store: Store<State>) {
  const gs = new GridViewerService(store);
  document.addEventListener(EVENT_X_KEY, () => {
    if (UrlUtil.isInGridViewer() || UrlUtil.isInThumbSlider()) {
      if (store.getState().mainViewer.images.length) {
        gs.applyTagForImagesInScreen();
      }
    }
  });

  document.addEventListener(EVENT_R_KEY, () => {
    if (UrlUtil.isInGridViewer()) {
      if (store.getState().mainViewer.images.length) {
        actions(store).reloadMainViewerImages(store.getState());
      }
    }
  });

  (document.addEventListener as any)(
    EVENT_UPDATE_IMAGE,
    (event: CustomEvent<{ hash: string; edit: any }>) => {
      const { hash } = event.detail;
      const { edit } = event.detail;
      StoreUtil.updateFieldInState([...hash], edit, store);
      // debounce(() => w.renderDedupperViewer(), 50);
      (window as any).renderDedupperViewer();
    }
  );
}
