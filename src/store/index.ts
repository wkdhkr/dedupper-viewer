import createStore from "unistore";
import devtools from "unistore/devtools";
import { State } from "../types/unistore";
import addEventListeners from "./eventListeners";

const initialState: State = {
  snackbar: {
    layoutUpdated: false
  },
  mainViewer: {
    images: []
  }
};

const store =
  process.env.NODE_ENV === "production"
    ? createStore(initialState)
    : devtools(createStore(initialState));

addEventListeners(store);
export default store;
