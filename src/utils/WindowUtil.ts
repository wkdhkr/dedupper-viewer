export default class WindowUtil {
  static isInIFrame = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };
}
