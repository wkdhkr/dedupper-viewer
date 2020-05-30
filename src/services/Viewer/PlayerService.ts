import DomUtil from "../../utils/DomUtil";

let originalTransition = true;

export default class PlayerService {
  timer: NodeJS.Timeout | null = null;

  intervalMs = 2000;

  saveOriginalTransition = () => {
    const viewer = DomUtil.getViewer();
    if (viewer) {
      originalTransition = (viewer as any).options.transition;
    }
  };

  clear = () => {
    if (!(this.timer === null)) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  switchGridPlay(isPlay: boolean, nextFn: Function) {
    if (this.timer === null) {
      if (isPlay) {
        this.timer = setInterval(() => {
          try {
            nextFn();
          } catch (e) {
            this.clear();
          }
        }, this.intervalMs);
      }
    } else {
      this.clear();
    }
  }

  switchPlay(isPlay: boolean) {
    if (this.timer === null) {
      if (isPlay) {
        this.saveOriginalTransition();
        this.timer = setInterval(() => {
          try {
            const viewer = DomUtil.getViewer();
            viewer.options.transition = false;
            viewer.next(true);
          } catch (e) {
            this.clear();
          }
        }, this.intervalMs);
      }
    } else {
      this.clear();
      try {
        const viewer = DomUtil.getViewer();
        viewer.options.transition = originalTransition;
      } catch (e) {
        // ignore viewer not found error.
        // may be page navigation.
      }
    }
  }
}
