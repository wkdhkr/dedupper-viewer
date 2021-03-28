import "./wdyr";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "unistore/react";
import { LocationProvider } from "@reach/router";
import ReactHotkeys from "react-hot-keys";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import store from "./store";
import { DedupperWindow } from "./types/window";

ReactHotkeys.defaultProps.filter = (event: KeyboardEvent) => {
  const target = (event.target as HTMLElement) || event.srcElement;
  const { tagName } = target;
  return !(
    target.isContentEditable ||
    // tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
};

/*
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
*/

const DedupperViewer = () => (
  <Provider store={store}>
    <LocationProvider>
      <App />
    </LocationProvider>
  </Provider>
);

(window as DedupperWindow).renderDedupperViewer = () => {
  ReactDOM.render(<DedupperViewer />, document.getElementById("root"));
};
(window as DedupperWindow).renderDedupperViewer();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
