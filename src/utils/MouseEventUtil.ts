let currentMouseMoveEvent: MouseEvent | null = null;
let currentPointerMoveEvent: PointerEvent | null = null;

let isMoved = false;

window.addEventListener("mousemove", (e: MouseEvent) => {
  isMoved = true;
  currentMouseMoveEvent = e;
});

window.addEventListener("pointermove", (e: PointerEvent) => {
  isMoved = true;
  currentPointerMoveEvent = e;
});

export default class MouseEventUtil {
  static resetMoved = () => {
    isMoved = false;
  };

  static isMoved = () => isMoved;

  static getMoveEvent = () => currentMouseMoveEvent;

  static getPointerMoveEvent = () => currentPointerMoveEvent;
}
