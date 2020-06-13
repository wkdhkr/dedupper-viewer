import { navigate } from "@reach/router";

export default class RouterUtil {
  static navigateForIFWrap = (
    url: string,
    hostname?: string,
    replace = false
  ) => {
    const u = new URL(window.location.origin + url);
    u.searchParams.set("parentHost", hostname || window.location.hostname);
    navigate(u.toString(), { replace });
  };

  static navigateForParent = (url: string) => {
    const w = window.parent || window;
    w.postMessage(
      {
        type: "navigate",
        payload: url
      },
      "*"
    );
  };
}
