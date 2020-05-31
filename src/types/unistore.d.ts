import React from "react";
import { Dictionary } from "lodash";
import { OptionsObject } from "notistack";

export interface DedupperChannel {
  id: string;
  name: string;
  sql: string;
}

export interface DedupperImage {
  t1: number | null;
  t2: number | null;
  t3: number | null;
  t4: number | null;
  t5: number | null;
  to_path: string;
  size: number;
  width: number;
  height: number;
  timestamp: number;
  drawing: number;
  neutral: number;
  hentai: number;
  hentai_porn: number;
  hentai_porn_sexy: number;
  hentai_sexy: number;
  neutral: number;
  porn: number;
  porn_sexy: number;
  sexy: number;
  rating: number;
  hash: string;
  trim: string;
}
export interface MainViewerState {
  isLoading: boolean;
  isOpen: boolean;
  isPlay: boolean;
  index: number;
  currentImage: DedupperImage | null;
  images: DedupperImage[];
}

export interface SubViewerState {
  isOpen: boolean;
}

export interface GridViewerState {
  selectedImage: DedupperImage | null;
  subViewer: SubViewerState;
  unit: number;
  isPlay: boolean;
  index: number;
}

export type SnackbarKind = "tagUpdated" | "ratingUpdated" | "layoutUpdated";
export type SnackbarCustomState = [React.ReactNode, OptionsObject];
export type SnackbarState = { [_ in SnackbarKind]: boolean };
export interface State {
  keyStatus: {
    shifted: boolean;
    controlled: boolean;
  };
  channels: DedupperChannel[];
  snackbar: SnackbarState;
  snackbarCustom: SnackbarCustomState | null;
  imageByHash: Dictionary<DedupperImage>;
  channelById: Dictionary<DedupperChannel>;
  gridViewer: GridViewerState;
  mainViewer: MainViewerState;
}
