import createStore from "unistore";
import { navigate } from "@reach/router";
import devtools from "unistore/devtools";
import axios from "axios";
import { setAutoFreeze } from "immer";
import { State } from "../types/unistore";
import addEventListeners from "./eventListeners";
import addKeyEventListeners from "./keyEventListeners";
import actions from "../actions";
import addCustomEventListeners from "./customEventListeners";
import UrlUtil from "../utils/dedupper/UrlUtil";

const initialState: State = {
  keyStatus: {
    shifted: false,
    controlled: false
  },
  snackbar: {
    tagUpdated: false,
    ratingUpdated: false,
    layoutUpdated: false
  },
  snackbarCustom: null,
  imageByHash: {},
  channels: [],
  channelById: {},
  mainViewer: {
    isLoading: false,
    index: -1,
    isOpen: true,
    isPlay: false,
    currentImage: null,
    images: []
  },
  gridViewer: {
    subViewer: {
      isOpen: false
    },
    unit: parseInt(UrlUtil.extractParam("unit") || "0", 10) || 3,
    selectedImage: null,
    isPlay: false,
    index: -1
  }
};

const store =
  process.env.NODE_ENV === "production"
    ? createStore(initialState)
    : devtools(createStore(initialState));

addEventListeners(store);
addKeyEventListeners(store);
addCustomEventListeners(store);

(window as any).store = store;
(window as any).axios = axios;
(window as any).actions = actions(store);
(window as any).navigate = navigate;

setAutoFreeze(false); // for cross-window processing
export default store;
