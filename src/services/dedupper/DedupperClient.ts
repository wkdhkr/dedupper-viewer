import axios from "axios";
import rateLimit from "axios-rate-limit";
import UrlUtil from "../../utils/dedupper/UrlUtil";

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000
});

export default class DedupperClient {
  update = async (hash: string, obj: Record<string, any>) => {
    const u = UrlUtil.setupApiUrlObj("rpc/sqlite/update");
    u.searchParams.append("hash", hash);
    const { data } = await http.post(u.href, obj);
    return data;
  };

  callSample = async () => {
    const u = UrlUtil.setupApiUrlObj("rpc/sqlite/all");
    // const sql = "SELECT * from hash where state >= 200 limit 1000";
    const requiredColumns = [
      "hash.hash",
      "hash.to_path",
      "hash.timestamp",
      "process_state.trim",
      "process_state.rating"
    ].join(", ");
    const baseCondition = "facepp = 2 AND nsfwjs = 2 AND missing = 0";
    const ratingCondition = "rating = 0";
    const ratioCondition =
      window.innerWidth > window.innerHeight
        ? "hash.ratio > 0.7"
        : "hash.ratio < 0.7";
    const pool = 500;
    const amount = 500;
    const sql =
      `SELECT ${requiredColumns} FROM hash ` +
      `inner join process_state on hash.hash = process_state.hash ` +
      `WHERE ${ratioCondition} AND ` +
      `hash.hash IN (SELECT hash FROM process_state ` +
      `WHERE ${baseCondition} AND ${ratingCondition} ` +
      `ORDER BY RANDOM() LIMIT ${pool}` +
      `) limit ${amount}`;
    u.searchParams.append("q", sql);
    const { data } = await http.get(u.href);
    return data;
  };
}
