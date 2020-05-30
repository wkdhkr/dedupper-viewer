import { Store } from "unistore";
import produce from "immer";
import { DedupperImage, State, SnackbarKind } from "../types/unistore";
import DedupperClient from "../services/dedupper/DedupperClient";

const dc = new DedupperClient();

export default class StoreUtil {
  static async updateField(
    hash: string,
    edit: Partial<DedupperImage>,
    snackbarName: SnackbarKind,
    store: Store<State>,
    table: "process_state" | "tag" = "process_state"
  ) {
    store.setState(
      produce(store.getState(), draft => {
        draft.mainViewer.images = StoreUtil.editImageInImages(
          hash,
          edit,
          draft.mainViewer.images
        );
        if (draft.mainViewer.currentImage) {
          if (draft.mainViewer.currentImage.hash === hash) {
            draft.mainViewer.currentImage = {
              ...draft.mainViewer.currentImage,
              ...edit
            };
          }
        }
        if (draft.gridViewer.selectedImage) {
          if (draft.gridViewer.selectedImage.hash === hash) {
            draft.gridViewer.selectedImage = {
              ...draft.gridViewer.selectedImage,
              ...edit
            };
          }
        }
        if (draft.imageByHash[hash]) {
          draft.imageByHash[hash] = {
            ...draft.imageByHash[hash],
            ...edit
          };
        }
      })
    );
    // await dc.update(hash, edit, table);
    // no wait
    dc.update(hash, edit, table);
    store.setState(
      produce(store.getState(), draft => {
        draft.snackbar[snackbarName] = true;
      })
    );
  }

  static editImageInImages(
    hash: string,
    edit: Partial<DedupperImage>,
    images: DedupperImage[]
  ) {
    return [
      ...images.map(image => {
        if (image.hash === hash) {
          return {
            ...image,
            ...edit
          };
        }
        return image;
      })
    ];
  }
}
