import { Store } from "unistore";
import produce from "immer";
import { State } from "../types/unistore";

export default function(store: Store<State>) {
  const setKey = (event: KeyboardEvent) => {
    const shifted = event.shiftKey;
    const controlled = event.ctrlKey;
    store.setState(
      produce(store.getState(), (draft) => {
        draft.keyStatus.shifted = shifted;
        draft.keyStatus.controlled = controlled;
      })
    );
  };

  document.addEventListener("keydown", setKey);
  document.addEventListener("keyup", setKey);

  /*
  hotkeys(
    "1,2,3,4,5"
      .split(",")
      .map(n => `${n},shift+${n}`)
      .join(","),
    (event, handler) => {
      const state = store.getState();
      const { currentImage } = state.mainViewer;
      if (currentImage) {
        let rating = parseInt(handler.key.replace("shift+", ""), 10) || 0;
        if (rating === currentImage.rating) {
          rating = 0;
        }
        actions(store).updateRating(state, currentImage.hash, rating);
      }
    }
  );
  hotkeys("space", () => {
    const state = store.getState();
    const { currentImage } = state.mainViewer;
    if (currentImage) {
      let value: number | null = 1;
      if (currentImage.t1) {
        value = null;
      }
      actions(store).updateTag(state, currentImage.hash, value, "t1");
    }
  });
  */
}
