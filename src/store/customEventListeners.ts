import { Store } from "unistore";
import * as log from "loglevel";
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
import IFrameUtil from "../utils/IFrameUtil";

export default function(store: Store<State>) {
  const gs = new GridViewerService(store);
  document.addEventListener(EVENT_X_KEY, () => {
    log.debug("EVENT_X_KEY", window.location.href);
    const state = store.getState();

    let flag = false;
    if (UrlUtil.isInGridViewer()) {
      flag = true;
    } else if (UrlUtil.isInThumbSlider()) {
      if (!UrlUtil.isInline()) {
        flag = true;
      } else if (store.getState().gridViewer.showMainViewer) {
        flag = true;
      } else {
        IFrameUtil.postMessageForParent({
          type: "forGrid",
          payload: {
            type: "customEvent",
            payload: {
              name: EVENT_X_KEY,
            },
          },
        });
      }
    }
    if (state.mainViewer.images.length && flag) {
      gs.applyTagForImagesInScreen();
    }
  });

  document.addEventListener(EVENT_R_KEY, () => {
    log.debug("EVENT_R_KEY", window.location.href);
    if (UrlUtil.isInGridViewer()) {
      if (store.getState().mainViewer.images.length) {
        actions(store).reloadMainViewerImages(store.getState());
      }
    }
  });

  (document.addEventListener as any)(
    EVENT_UPDATE_IMAGE,
    (event: CustomEvent<{ hash: string; edit: any }>) => {
      log.debug("EVENT_UPDATE_IMAGE", event.detail, window.location.href);
      const { hash } = event.detail;
      const { edit } = event.detail;
      StoreUtil.updateFieldInState([...hash], edit, store);
      // debounce(() => w.renderDedupperViewer(), 50);
      (window as any).renderDedupperViewer();
    }
  );
}
