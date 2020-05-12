import React from "react";
import { connect } from "unistore/react";
import "./App.css";
import { SnackbarProvider } from "notistack";
import actions from "./actions";
import { State, MainViewerState, SnackbarState } from "./types/unistore";
import MainViewer from "./containers/MainViewer";
import Snackbar from "./components/feedback/Snackbar";

interface BaseAppProps {
  finishLayoutUpdated: () => void;
  snackbar: SnackbarState;
  mainViewer: MainViewerState;
  loadMainViewerImages: () => Promise<void>;
}
type AppProps = BaseAppProps;

const mapStateToProps = "snackbar,mainViewer";

const App = connect<{}, {}, State, AppProps>(
  mapStateToProps,
  actions
)((props: AppProps) => (
  <SnackbarProvider maxSnack={10}>
    <div className="App">
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <MainViewer {...props.mainViewer} />
      <Snackbar state={props.snackbar} close={props.finishLayoutUpdated} />
    </div>
  </SnackbarProvider>
));

export default App;
