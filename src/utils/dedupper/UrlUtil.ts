import AuthUtil from "./AuthUtil";

const isLocalhost = window.location.hostname === "localhost";
const port = isLocalhost ? 8080 : 3000;
const hostname = isLocalhost ? "localhost" : window.location.hostname;

export default class UrlUtil {
  static BASE_URL = `http://${hostname}:${port}/dedupper/v1/`;

  static setupApiUrlObj = (path: string) => {
    const u = new URL(`${UrlUtil.BASE_URL}${path}`);
    u.searchParams.append("auth", AuthUtil.getAuthToken());
    u.searchParams.append("type", "TYPE_IMAGE");
    return u;
  };

  static isInChannel = () => {
    return window.location.pathname.split("/").includes("channel");
  };

  static isInGridViewer = () => {
    return window.location.pathname.split("/").includes("grid");
  };

  static isInSingleViewer = () => {
    return window.location.pathname.split("/").includes("image");
  };

  static togglePlay = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("play")) {
      url.searchParams.delete("play");
    } else {
      url.searchParams.set("play", "1");
    }
    window.history.replaceState(null, document.title, url.toString());
  };

  static generateImageUrl = (hash: string) => {
    const auth = AuthUtil.getAuthToken();
    return `${UrlUtil.BASE_URL}rpc/image/download?hash=${hash}&type=TYPE_IMAGE&auth=${auth}`;
  };

  static generateImageViewerUrl = (hash: string) => {
    return `/image/${hash}`;
  };

  static extractChannelId = () => {
    if (UrlUtil.isInChannel()) {
      const matches = window.location.pathname
        .split("/")
        .filter(d =>
          d.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
        );
      return matches.pop() || null;
    }
    return null;
  };

  static extractHashParam = (url: string) =>
    new URL(url).searchParams.get("hash");
}
