import { Store } from "unistore";
import produce from "immer";
import { DedupperImage, State, SnackbarKind } from "../types/unistore";
import DedupperClient from "../services/dedupper/DedupperClient";
import ImageArrayUtil from "./ImageArrayUtil";

const dc = new DedupperClient();

export default class StoreUtil {
  static updateFieldInState(
    hashList: string[],
    edit: Partial<DedupperImage>,
    store: Store<State>
  ) {
    const newState = produce(store.getState(), draft => {
      draft.mainViewer.images = StoreUtil.editImageInImages(
        hashList,
        edit,
        draft.mainViewer.images
      );
      if (draft.mainViewer.currentImage) {
        if (hashList.includes(draft.mainViewer.currentImage.hash)) {
          draft.mainViewer.currentImage = {
            ...draft.mainViewer.currentImage,
            ...edit
          };
        }
      }
      if (draft.gridViewer.selectedImage) {
        if (hashList.includes(draft.gridViewer.selectedImage.hash)) {
          draft.gridViewer.selectedImage = {
            ...draft.gridViewer.selectedImage,
            ...edit
          };
        }
      }
      hashList.forEach(h => {
        if (draft.imageByHash[h]) {
          draft.imageByHash[h] = {
            ...draft.imageByHash[h],
            ...edit
          };
        }
      });
    });
    store.setState(newState);
  }

  static async updateField(
    hash: string | string[],
    edit: Partial<DedupperImage>,
    snackbarName: SnackbarKind,
    store: Store<State>,
    table: "process_state" | "tag" = "process_state",
    silent = false
  ) {
    const hashList = ImageArrayUtil.toArray(hash);
    StoreUtil.updateFieldInState(hashList, edit, store);
    // await dc.update(hash, edit, table);
    // no wait
    Promise.all(hashList.map(h => dc.update(h, edit, table)));
    if (!silent) {
      store.setState(
        produce(store.getState(), draft => {
          draft.snackbar[snackbarName] = true;
        })
      );
    }
  }

  static editImageInImages(
    hashList: string[],
    edit: Partial<DedupperImage>,
    images: DedupperImage[]
  ) {
    return [
      ...images.map(image => {
        if (hashList.includes(image.hash)) {
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
