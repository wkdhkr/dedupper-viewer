import createStore from "unistore";
import devtools from "unistore/devtools";
import axios from "axios";
import { State } from "../types/unistore";
import addEventListeners from "./eventListeners";
import addKeyEventListeners from "./keyEventListeners";
import DedupperClient from "../services/dedupper/DedupperClient";

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

(window as any).store = store;
(window as any).axios = axios;
(window as any).dc = new DedupperClient();

export default store;
