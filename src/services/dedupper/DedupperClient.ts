import axios from "axios";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import { DedupperChannel } from "../../types/unistore";
// import rateLimit from "axios-rate-limit";
// import Queue from "promise-queue";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ConcurrencyManager } = require("axios-concurrency");

/*
const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000 * 30
});
*/

/*
const maxConcurrent = 1;
const maxQueue = Infinity;
const queue = new Queue(maxConcurrent, maxQueue);
*/

// a concurrency parameter of 1 makes all api requests secuential
const MAX_CONCURRENT_REQUESTS = 1;

// init your manager.
const http = axios;
const manager = ConcurrencyManager(http, MAX_CONCURRENT_REQUESTS);

export default class DedupperClient {
  createChannel = async (channel: DedupperChannel) => {
    const u = UrlUtil.setupApiUrlObj(`channels/`);
    const { data } = await axios.post(u.href, channel);
    return data;
  };

  updateChannel = async (channel: DedupperChannel) => {
    const u = UrlUtil.setupApiUrlObj(`channel/${channel.id}`);
    const { data } = await http.put(u.href, channel);
    return data;
  };

  deleteChannel = async (id: string) => {
    const u = UrlUtil.setupApiUrlObj(`channel/${id}`);
    const { data } = await http.delete(u.href, {});
    return data;
  };

  fetchChannels = async () => {
    const u = UrlUtil.setupApiUrlObj("channels");
    const { data } = await http.get(u.href);
    return data;
  };

  fetchChannel = async (id: string): Promise<DedupperChannel> => {
    const u = UrlUtil.setupApiUrlObj(`channel/${id}`);
    const { data } = await http.get(u.href);
    return data;
  };

  update = async (hash: string, obj: Record<string, any>, table: string) => {
    const u = UrlUtil.setupApiUrlObj("rpc/sqlite/update");
    u.searchParams.append("hash", hash);
    u.searchParams.append("table", table);
    const { data } = await http.post(u.href, obj);
    return data;
  };

  query = async (sql: string) => {
    const u = UrlUtil.setupApiUrlObj("rpc/sqlite/all");
    u.searchParams.append("q", sql);
    u.searchParams.append("ff", "1");
    const { data } = await http.get(u.href);
    return data;
  };
}
