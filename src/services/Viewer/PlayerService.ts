import DomUtil from "../../utils/DomUtil";

let originalTransition = true;

export default class PlayerService {
  timer: NodeJS.Timeout | null = null;

  initialWaitMs = 2000;

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

  switchGridPlay(isPlay: boolean, nextFn: Function, interval: number) {
    if (this.timer === null) {
      if (isPlay) {
        setTimeout(() => {
          this.timer = setInterval(() => {
            try {
              nextFn();
            } catch (e) {
              this.clear();
            }
          }, interval * 1000);
        }, this.initialWaitMs);
      }
    } else {
      this.clear();
    }
  }

  switchPlay(isPlay: boolean, interval: number) {
    if (this.timer === null) {
      if (isPlay) {
        this.saveOriginalTransition();
        this.timer = setInterval(() => {
          try {
            const viewer = DomUtil.getViewer();
            viewer.options.transition = false;
            if (viewer.items.length) {
              viewer.next(true);
            }
          } catch (e) {
            this.clear();
          }
        }, interval * 1000);
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
