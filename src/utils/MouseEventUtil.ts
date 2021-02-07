let currentMouseMoveEvent: MouseEvent | null = null;

window.addEventListener("mousemove", (e: MouseEvent) => {
  currentMouseMoveEvent = e;
});

export default class MouseEventUtil {
  static getMoveEvent = () => currentMouseMoveEvent;
}
