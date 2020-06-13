import { ConfigurationState } from "../types/unistore";

const CONFIGURATION_LS_KEY = "_dedupper_viewer_configuration";

const c: ConfigurationState = JSON.parse(
  localStorage.getItem(CONFIGURATION_LS_KEY) || "{}"
);

export const APP_NAME = "Dedupper Viewer";

export const STANDARD_WIDTH = c.standardWidth || 1920;
export const STANDARD_HEIGHT = c.standardHeight || 1080;

export const EVENT_X_KEY = "EVENT_X_KEY";
export const EVENT_R_KEY = "EVENT_R_KEY";

export const EVENT_UPDATE_IMAGE = "EVENT_UPDATE_IMAGE";
