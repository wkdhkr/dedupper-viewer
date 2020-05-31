import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "unistore/react";
import { LocationProvider } from "@reach/router";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import store from "./store";
import SubViewer from "./components/viewer/SubViewer";

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

(window as any).renderDedupperViewer = () => {
  ReactDOM.render(<DedupperViewer />, document.getElementById("root"));
};
(window as any).renderDedupperViewer();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
