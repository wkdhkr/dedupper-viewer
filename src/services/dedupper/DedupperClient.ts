import axios from "axios";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import { DedupperChannel } from "../../types/unistore";
import AxiosUtil from "../../utils/AxiosUtil";

// init your manager.
const http = axios.create();

export default class DedupperClient {
  createChannel = async (channel: DedupperChannel) => {
    const u = UrlUtil.setupApiUrlObj(`channels/`);
    const { data } = await http.post(u.href, channel);
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
    const { data } = await axios.get(u.href);
    return data;
  };

  fetchChannel = async (id: string): Promise<DedupperChannel> => {
    const u = UrlUtil.setupApiUrlObj(`channel/${id}`);
    const { data } = await axios.get(u.href);
    return data;
  };

  update = async (hash: string, obj: Record<string, any>, table: string) => {
    const u = UrlUtil.setupApiUrlObj("rpc/sqlite/update");
    u.searchParams.append("hash", hash);
    u.searchParams.append("table", table);
    const { data } = await AxiosUtil.getInstance(hash).post(u.href, obj);
    return data;
  };

  query = async (sql: string, ff = true) => {
    const u = UrlUtil.setupApiUrlObj("rpc/sqlite/all");
    u.searchParams.append("q", sql);
    if (ff) {
      u.searchParams.append("ff", "1");
    }
    const { data } = await axios.get(u.href);
    return data;
  };
}
