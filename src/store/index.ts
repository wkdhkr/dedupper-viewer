import createStore from "unistore";
import * as log from "loglevel";
import axios from "axios";
import { navigate } from "@reach/router";
// import devtools from "unistore/devtools";
import { setAutoFreeze } from "immer";
import { State } from "../types/unistore";
import addEventListeners from "./eventListeners";
import addKeyEventListeners from "./keyEventListeners";
import actions from "../actions";
import addCustomEventListeners from "./customEventListeners";
import addMessageEventListeners from "./messageEventListeners";
import UrlUtil from "../utils/dedupper/UrlUtil";
import ConfigurationHelper from "../helpers/ConfigurationHelper";
import UtilsBundle from "../utils/UtilsBundle";

log.setDefaultLevel("trace");

const initialState: State = {
  imagesCache: {},
  sortKind: ConfigurationHelper.getInitialState().defaultSortKind,
  connectionCount: 0,
  configuration: {
    ...ConfigurationHelper.getInitialState(),
    ...JSON.parse(
      localStorage.getItem("_dedupper_viewer_configuration") || "{}"
    ),
    open: false,
  },
  keyStatus: {
    shifted: false,
    controlled: false,
  },
  snackbar: {
    tagUpdated: false,
    ratingUpdated: false,
    layoutUpdated: false,
  },
  snackbarCustom: null,
  imageByHash: {},
  channels: [],
  channelById: {},
  mainViewer: {
    faces: [],
    subViewer: {
      url: null,
      isOpen: false,
    },
    isLoading: false,
    index: -1,
    isOpen: true,
    isPlay: false,
    currentImage: null,
    images: [],
  },
  gridViewer: {
    showMainViewer: false,
    subViewer: {
      isOpen: false,
    },
    unit: parseInt(UrlUtil.extractParam("unit") || "0", 10) || 3,
    gestureInfo: {
      image: null,
      x: -1,
      y: -1,
    },
    selectedImage: null,
    isPlay: false,
    index: -1,
  },
  thumbSlider: {
    gestureInfo: {
      image: null,
      x: -1,
      y: -1,
    },
    selectedImage: null,
    index: -1,
  },
};

/*
const store =
  process.env.NODE_ENV === "production"
    ? createStore(initialState)
    : devtools(createStore(initialState));
 */
const store = createStore(initialState);
log.info("initialized", "store");
addEventListeners(store);
log.info("initialized", "eventListener");
addKeyEventListeners(store);
log.info("initialized", "keyEventListener");
addCustomEventListeners(store);
log.info("initialized", "customEventListener");
addMessageEventListeners(store);
log.info("initialized", "MessageEventListener");

(window as any).store = store;
(window as any).axios = axios;
(window as any).actions = actions(store);
log.info("initialized", "actions");
(window as any).navigate = navigate;
(window as any).UtilsBundle = UtilsBundle;

log.info("initialState", store.getState());

setAutoFreeze(false); // for cross-window processing
export default store;
