import AuthUtil from "./AuthUtil";
import WindowUtil from "../WindowUtil";
import { ConfigurationState } from "../../types/unistore";

/*
const isLocalhost = window.location.hostname === "localhost";
const port = isLocalhost ? 8080 : 3000;
const hostname = isLocalhost ? "localhost" : window.location.hostname;
*/
const { hostname } = window.location;
// const { protocol } = window.location;
// const { port } = window.location;
// const port = 8443;

const CONFIGURATION_LS_KEY = "_dedupper_viewer_configuration";

const c: ConfigurationState = JSON.parse(
  localStorage.getItem(CONFIGURATION_LS_KEY) || "{}"
);

const getPath = (url?: string) => {
  if (url) {
    const u = new URL(url);
    return u.pathname;
  }
  return window.location.pathname;
};

export default class UrlUtil {
  static BASE_URL = `${c.dedupperServerProtocol ||
    "http"}://${hostname}:${c.dedupperServerPort || "8080"}/dedupper/v1/`;

  static getFlickrUrl = (path: string) => {
    const fileName = path.split(/(\\|\/)/g).pop();
    if (!fileName) {
      return null;
    }
    if (fileName.includes("flickr_")) {
      const parsedFileName = fileName.split("_");
      if (parsedFileName.length !== 2) {
        return null;
      }
      const id = parsedFileName[1];
      return `https://www.flickr.com/photo.gne?id=${id}`;
    }
    return null;
  };

  static buildAcdUrl = (acdId: string, domain: string) => {
    return `https://${domain}/photos/all/gallery/${acdId}?ref_=cd_lts_sn&sort=sortDateUploaded`;
  };

  static setupApiUrlObj = (path: string) => {
    const u = new URL(`${UrlUtil.BASE_URL}${path}`);
    u.searchParams.append("auth", AuthUtil.getAuthToken());
    u.searchParams.append("type", "TYPE_IMAGE");
    return u;
  };

  static isInThumbSlider = (url?: string) => {
    return getPath(url)
      .split("/")
      .includes("thumbs");
  };

  static isInChannels = (url?: string) => {
    return getPath(url)
      .split("/")
      .includes("channels");
  };

  static isInChannel = (url?: string) => {
    return getPath(url)
      .split("/")
      .includes("channel");
  };

  static isInGridViewer = (url?: string) => {
    return getPath(url)
      .split("/")
      .includes("grid");
  };

  static isInSingleViewer = (url?: string) => {
    return getPath(url)
      .split("/")
      .includes("image");
  };

  static isInSubViewer = (url?: string) => {
    return (
      UrlUtil.isInSingleViewer(url) &&
      UrlUtil.extractParam("mode", url) === "subviewer"
    );
  };

  static isInMainViewer = (url?: string) => {
    return UrlUtil.isInGridViewer(url) === false && UrlUtil.isInChannel(url);
  };

  static isInlineMainViewer = (url?: string) => {
    return UrlUtil.isInMainViewer(url) && UrlUtil.isInline(url);
  };

  static isInline = (url?: string) => {
    const searchParams = url
      ? new URL(url).searchParams
      : new URLSearchParams(window.location.search);
    return searchParams.get("inline") === "1";
  };

  static isInStart = (url?: string) => {
    return getPath(url)
      .split("/")
      .includes("start");
  };

  static changeUnit = (n?: number, sourceUrl?: string) => {
    if (!UrlUtil.isInGridViewer()) {
      return;
    }
    const url = new URL(sourceUrl || window.location.href);
    if (n) {
      url.searchParams.set("unit", String(n));
    } else {
      url.searchParams.delete("unit");
    }
    UrlUtil.replace(url);
  };

  static replace = (url: URL) => {
    window.history.replaceState(null, document.title, url.toString());
    if (WindowUtil.isInIFrame()) {
      window.parent.postMessage(
        {
          type: "navigateParent",
          payload: url.pathname + url.search,
        },
        "*"
      );
    }
  };

  static isPlay = (sourceUrl?: string) => {
    const url = new URL(sourceUrl || window.location.href);
    return Boolean(url.searchParams.get("play"));
  };

  static getPlayInterval = (sourceUrl?: string) => {
    const url = new URL(sourceUrl || window.location.href);
    return parseInt(url.searchParams.get("interval") || "0", 10) || null;
  };

  static syncPlay = (isPlay: boolean) => {
    const url = new URL(window.location.href);
    if (!isPlay) {
      url.searchParams.delete("play");
    } else {
      url.searchParams.set("play", "1");
    }
    UrlUtil.replace(url);
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
        .filter((d) =>
          d.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
        );
      return matches.pop() || null;
    }
    return null;
  };

  static isInListThumbSlider = (url?: string) =>
    UrlUtil.isInThumbSlider(url) &&
    UrlUtil.extractParam("mode", url) === "list";

  static isInPHashThumbSlider = (url?: string) =>
    UrlUtil.isInThumbSlider(url) &&
    UrlUtil.extractParam("mode", url) === "phash";

  static isInTimeThumbSlider = (url?: string) =>
    UrlUtil.isInThumbSlider(url) &&
    UrlUtil.extractParam("mode", url) === "time";

  static isInRecommend = (url?: string) => UrlUtil.isInTimeThumbSlider(url);

  static isInRecommended = (url?: string) =>
    UrlUtil.extractParam("recommended", url) === "1";

  static extractOrientation = (url?: string) => UrlUtil.extractParam("o", url);

  static isPortrait = (url?: string) => {
    const o = UrlUtil.extractOrientation(url);
    if (o) {
      return o === "portrait";
    }
    return window.innerHeight > window.innerWidth;
  };

  static isLandscape = (url?: string) => !UrlUtil.isPortrait(url);

  static extractParam = (name: string, url?: string) =>
    new URL(url || window.location.href).searchParams.get(name);

  static extractHashParam = (url?: string) => UrlUtil.extractParam("hash", url);
}
