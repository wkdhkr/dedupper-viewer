import produce from "immer";
import { Store } from "unistore";
import { State } from "../types/unistore";
import DedupperClient from "../services/dedupper/DedupperClient";

const dc = new DedupperClient();

const actions = (store: Store<State>) => ({
  finishLayoutUpdated(state: State) {
    return produce(state, draft => {
      draft.snackbar.layoutUpdated = false;
    });
  },
  async updateTrim(state: State, hash: string, trim: string) {
    store.setState(
      produce(state, draft => {
        draft.mainViewer.images = [
          ...draft.mainViewer.images.map(image => {
            if (image.hash === hash) {
              return {
                ...image,
                trim
              };
            }
            return image;
          })
        ];
        draft.snackbar.layoutUpdated = true;
      })
    );
    await dc.update(hash, { trim });
  },
  async loadMainViewerImages(state: State) {
    const images = await dc.callSample();
    store.setState(
      produce(state, (draft: State) => {
        draft.mainViewer.images = images;
      })
    );
  }
});

export default actions;
