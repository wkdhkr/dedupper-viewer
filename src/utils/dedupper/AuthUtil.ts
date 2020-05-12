import secrets from "./secrets.json";

export default class AuthUtil {
  static getAuthToken = () => {
    return secrets.token;
  };
}
