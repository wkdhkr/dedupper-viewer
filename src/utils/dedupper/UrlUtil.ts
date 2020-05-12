import AuthUtil from "./AuthUtil";

export default class UrlUtil {
  static BASE_URL = "http://localhost:8080/dedupper/v1/";

  static setupApiUrlObj = (path: string) => {
    const u = new URL(`${UrlUtil.BASE_URL}${path}`);
    u.searchParams.append("auth", AuthUtil.getAuthToken());
    u.searchParams.append("type", "TYPE_IMAGE");
    return u;
  };

  static generateImageUrl = (hash: string) => {
    const auth = AuthUtil.getAuthToken();
    return `${UrlUtil.BASE_URL}rpc/image/download?hash=${hash}&type=TYPE_IMAGE&auth=${auth}`;
  };

  static extractHashParam = (url: string) =>
    new URL(url).searchParams.get("hash");
}
