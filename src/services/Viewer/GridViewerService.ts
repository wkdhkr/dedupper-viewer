import { Store } from "unistore";
import ImageArrayUtil from "../../utils/ImageArrayUtil";
import { State } from "../../types/unistore";
import actions from "../../actions";
import ViewerUtil from "../../utils/ViewerUtil";

export default class GridViewerService {
  store: Store<State>;

  constructor(store: Store<State>) {
    this.store = store;
  }

  applyTagForImagesInScreen = (t = "t1") => {
    const state = this.store.getState();
    const { images } = state.mainViewer;
    const { unit: sourceUnit, index } = state.gridViewer;
    const [unit, range] = ViewerUtil.detectUnitAndRange(sourceUnit);

    const fitImages = ImageArrayUtil.fitAmountForGridUnit(
      images,
      ViewerUtil.calcRange(unit)
    );
    if (fitImages.length) {
      const leftTopIndex = index - (index % range);
      const hashList = fitImages
        .slice(leftTopIndex, leftTopIndex + range)
        .filter(i => i.rating < 1)
        .filter(i => (i.t1 || 0) < 1)
        .map(i => i.hash);

      actions(this.store).selected(
        state,
        ...ImageArrayUtil.detectDestination(fitImages, leftTopIndex + range)
      );

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
