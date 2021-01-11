import axios, { AxiosInstance } from "axios";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ConcurrencyManager } = require("axios-concurrency");

export default class AxiosUtil {
  static instanceLookup: { [x: string]: AxiosInstance } = {};

  static getInstance = (id: string) => {
    if (AxiosUtil.instanceLookup[id]) {
      return AxiosUtil.instanceLookup[id];
    }
    // a concurrency parameter of 1 makes all api requests sequential
    const MAX_CONCURRENT_REQUESTS = 1;

    // init your manager.
    const http = axios.create();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const manager = ConcurrencyManager(http, MAX_CONCURRENT_REQUESTS);
    AxiosUtil.instanceLookup[id] = http;
    return http;
  };
}
