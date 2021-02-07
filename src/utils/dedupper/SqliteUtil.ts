function parseBigInt(str: string, base = 10) {
  const bi = BigInt(base);
  let bigint = BigInt(0);
  for (let i = 0; i < str.length; i += 1) {
    let code = str[str.length - 1 - i].charCodeAt(0) - 48;
    if (code >= 10) code -= 39;
    bigint += bi ** BigInt(i) * BigInt(code);
  }
  return bigint;
}
export default class SqliteUtil {
  static buildPHashCondition = (pHash: string) => {
    const expandedPHashs = SqliteUtil.expandPHash(pHash);
    const pHashsStirng = [
      ...new Set(expandedPHashs.map((p) => SqliteUtil.expandPHash(p)).flat()),
    ]
      .map((x) => `'${x}'`)
      .join(",");
    // return `p_hash in ('${pHash}',${pHashsStirng})`;
    return `p_hash in (${pHashsStirng})`;
  };

  static expandPHash = (pHash: string) => {
    const i = parseInt(pHash, 10);
    const b = i.toString(2).padStart(64, "0");

    return Array.from(Array(64).keys())
      .map((n) => {
        const newB = b;
        const newBChars = newB.split("");
        newBChars[n] = newB[n] === "0" ? "1" : "0";
        return newBChars.join("");
      })
      .map((x) => `${parseBigInt(x, 2)}`);
  };
}
