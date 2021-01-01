import React from "react";
import { Dictionary } from "lodash";
import { OptionsObject } from "notistack";

export type FacePPGender = "Female" | "Male";
export type FacePPGlass = "None" | "Dark" | "Normal";

export interface FacePPRow {
  landmark: string;
  image_id: string;
  hash: string;
  face_token: string;
  face_num: number;
  version: number;
  emotion_sadness: number;
  emotion_neutral: number;
  emotion_disgust: number;
  emotion_anger: number;
  emotion_surprise: number;
  emotion_fear: number;
  emotion_happiness: number;
  beauty_female_score: number;
  beauty_male_score: number;
  gender: FacePPGender;
  age: number;
  mouth_close: number;
  mouth_surgical_mask_or_respirator: number;
  mouth_open: number;
  mouth_other_occlusion: number;
  glass: FacePPGlass;
  skin_dark_circle: number;
  skin_stain: number;
  skin_acne: number;
  skin_health: number;
  headpose_status: number;
  headpose_yaw_angle: number;
  headpose_pitch_angle: number;
  headpose_roll_angle: number;
  gaussianblur: number;
  motionblur: number;
  blurness: number;
  smile: number;
  eye_status_left_normal_glass_eye_open: number;
  eye_status_left_normal_glass_eye_close: number;
  eye_status_left_no_glass_eye_close: number;
  eye_status_left_no_glass_eye_open: number;
  eye_status_left_occlusion: number;
  eye_status_left_dark_glasses: number;
  eye_status_right_normal_glass_eye_open: number;
  eye_status_right_normal_glass_eye_close: number;
  eye_status_right_no_glass_eye_close: number;
  eye_status_right_no_glass_eye_open: number;
  eye_status_right_occlusion: number;
  eye_status_right_dark_glasses: number;
  eyegaze_right_position_x_coordinate: number;
  eyegaze_right_position_y_coordinate: number;
  eyegaze_right_vector_z: number;
  eyegaze_right_vector_x: number;
  eyegaze_right_vector_y: number;
  eyegaze_left_position_x_coordinate: number;
  eyegaze_left_position_y_coordinate: number;
  eyegaze_left_vector_z: number;
  eyegaze_left_vector_x: number;
  eyegaze_left_vector_y: number;
  facequality: number;
  ethnicity: string;
  eye_gaze_status: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

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
  acd_id: string | null;
  to_path: string;
  view_date: number;
  view_count: number;
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
  faces: FacePPRow[];
  isLoading: boolean;
  subViewer: SubViewerState & { url: string | null };
  isOpen: boolean;
  isPlay: boolean;
  index: number;
  currentImage: DedupperImage | null;
  images: DedupperImage[];
}

export interface SubViewerState {
  isOpen: boolean;
}

export interface GestureInfo {
  image: DedupperImage | null;
  x: number;
  y: number;
}

export interface GridViewerState {
  gestureInfo: GestureInfo;
  selectedImage: DedupperImage | null;
  subViewer: SubViewerState;
  unit: number;
  isPlay: boolean;
  index: number;
}

export interface ConfigurationState {
  amazonCloudDriveDomain: string;
  dedupperServerProtocol: "http" | "https";
  dedupperServerPort: number;
  recordPlayStatistics: boolean;
  flipRandomInPlay: number;
  standardWidth: number;
  standardHeight: number;
  showFacePP: "hover" | "always" | "none";
  enableSubViewer: boolean;
  selectNextAfterEditInMainViewer: boolean;
  selectNextAfterEditInGridViewer: boolean;
  iframeOrigin: string;
  maxJSHeapSize: number;
  autoReload: boolean;
  gridViewerPlayInterval: number;
  mainViewerPlayInterval: number;
  open: boolean;
}

export type SnackbarKind = "tagUpdated" | "ratingUpdated" | "layoutUpdated";
export type SnackbarCustomState = [React.ReactNode, OptionsObject];
export type SnackbarState = { [_ in SnackbarKind]: boolean };
export interface State {
  configuration: ConfigurationState;
  keyStatus: {
    shifted: boolean;
    controlled: boolean;
  };
  channels: DedupperChannel[];
  connectionCount: number;
  snackbar: SnackbarState;
  snackbarCustom: SnackbarCustomState | null;
  imageByHash: Dictionary<DedupperImage>;
  channelById: Dictionary<DedupperChannel>;
  gridViewer: GridViewerState;
  mainViewer: MainViewerState;
}
