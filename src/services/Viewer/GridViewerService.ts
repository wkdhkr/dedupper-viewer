import { Store } from "unistore";
import ImageArrayUtil from "../../utils/ImageArrayUtil";
import { State } from "../../types/unistore";
import actions from "../../actions";
import ViewerUtil from "../../utils/ViewerUtil";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import ThumbSliderUtil from "../../utils/ThumbSliderUtil";

export default class GridViewerService {
  store: Store<State>;

  constructor(store: Store<State>) {
    this.store = store;
  }

  applyTagForImagesInScreenForSlider = (t = "t1") => {
    const state = this.store.getState();
    const currentHash = state.thumbSlider.selectedImage?.hash;
    const { images } = state.mainViewer;
    if (!currentHash) {
      return;
    }
    const startHash = ThumbSliderUtil.getLeftTopHash(
      currentHash,
      state.mainViewer.images,
      this.store.getState().configuration
    );
    const startIndex = state.mainViewer.images.findIndex(
      (i) => i.hash === startHash
    );

    const nextStartHash = ThumbSliderUtil.getNextLeftTopHash(
      currentHash,
      state.mainViewer.images,
      this.store.getState().configuration
    );

    const nextStartIndex = state.mainViewer.images.findIndex(
      (i) => i.hash === nextStartHash
    );

    const hashList: string[] = [];
    let fixedNextStartIndex = nextStartIndex;
    if (nextStartIndex === 0) {
      fixedNextStartIndex = state.mainViewer.images.length;
    }
    for (let i = startIndex; i < fixedNextStartIndex; i += 1) {
      if (t === "t1" && images[i].rating > 0) {
        // ignore
      } else {
        hashList.push(images[i].hash);
      }
    }
    actions(this.store).selected(state, nextStartHash, nextStartIndex);
    setTimeout(() => {
      if (hashList.length) {
        actions(this.store).updateTag(
          this.store.getState(),
          hashList,
          1,
          t,
          false
        );
      }
    }, 3000);
  };

  applyTagForImagesInScreen = (t = "t1") => {
    const isSlider = UrlUtil.isInThumbSlider();
    if (isSlider) {
      this.applyTagForImagesInScreenForSlider(t);
      return;
    }
    const state = this.store.getState();
    const { images } = state.mainViewer;
    const { unit, index } = state.gridViewer;
    const range = ViewerUtil.detectRange(unit);
    const fitImages = ImageArrayUtil.fitAmountForGridUnit(
      images,
      ViewerUtil.calcRange(unit)
    );
    if (fitImages.length) {
      const leftTopIndex = index - (index % range);
      const hashList = fitImages
        .slice(leftTopIndex, leftTopIndex + range)
        .filter((i) => t !== "t1" && i.rating < 1)
        .filter((i) => (i.t1 || 0) < 1)
        .map((i) => i.hash);

      const nextIndex = leftTopIndex + range;
      const args = [
        ...ImageArrayUtil.detectDestination(fitImages, nextIndex),
        this.store.getState().configuration.enableSubViewer,
      ] as const;
      actions(this.store).selected(state, ...args);

      setTimeout(() => {
        if (hashList.length) {
          actions(this.store).updateTag(
            this.store.getState(),
            hashList,
            1,
            t,
            false
          );
        }
      }, 3000);
    }
  };
}
