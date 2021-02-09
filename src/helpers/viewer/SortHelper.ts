import arrayShuffle from "array-shuffle";
import pathParse from "path-parse";
import { DedupperImage, SortKind } from "../../types/unistore";

const simpleSortFn = (a: any, b: any) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

const createSortFn = (convert: (x: DedupperImage) => string | number) => {
  return (a: DedupperImage, b: DedupperImage) => {
    const a2 = convert(a);
    const b2 = convert(b);
    return simpleSortFn(a2, b2);
  };
};

const sortFunctionLookup: {
  [x in SortKind]: (a: DedupperImage, b: DedupperImage) => number;
} = {
  reviewed: createSortFn(
    (x: DedupperImage) => x.t1 || x.rating || x.t2 || x.t3 || x.t4 || x.t5 || 0
  ),
  file_name: createSortFn((x: DedupperImage) => pathParse(x.to_path).base),
  file_path: createSortFn((x: DedupperImage) => x.to_path),
  file_size: createSortFn((x: DedupperImage) => x.size),
  rating: createSortFn((x: DedupperImage) => x.rating),
  sexy: createSortFn((x: DedupperImage) => x.sexy),
  porn: createSortFn((x: DedupperImage) => x.porn),
  porn_sexy: createSortFn((x: DedupperImage) => x.porn_sexy),
  neutral: createSortFn((x: DedupperImage) => x.neutral),
  hentai_sexy: createSortFn((x: DedupperImage) => x.hentai_sexy),
  hentai_porn_sexy: createSortFn((x: DedupperImage) => x.hentai_porn_sexy),
  hentai_porn: createSortFn((x: DedupperImage) => x.hentai_porn),
  hentai: createSortFn((x: DedupperImage) => x.hentai),
  drawing: createSortFn((x: DedupperImage) => x.drawing),
  timestamp: createSortFn((x: DedupperImage) => x.timestamp),
  width: createSortFn((x: DedupperImage) => x.width),
  height: createSortFn((x: DedupperImage) => x.height),
  resolution: createSortFn((x: DedupperImage) => x.width * x.height),
  view_count: createSortFn((x: DedupperImage) => x.view_count),
  view_date: createSortFn((x: DedupperImage) => x.view_date),
  delete: createSortFn((x: DedupperImage) => x.t1 || 0),
  random: () => 0,
};

export default class SortHelper {
  static sort = (
    sortKind: SortKind,
    secondarySortKind: SortKind,
    images: DedupperImage[]
  ) => {
    const sortFn = sortFunctionLookup[sortKind];
    const secondarySortFn = sortFunctionLookup[secondarySortKind];
    const sorted = images.sort((a, b) => {
      const result = sortFn(a, b);
      if (result !== 0) {
        return result;
      }
      return secondarySortFn(a, b);
    });
    if (sortKind === "random") {
      return arrayShuffle(sorted);
    }
    return sorted;
  };
}
