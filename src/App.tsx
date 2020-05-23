import React from "react";
import { connect } from "unistore/react";
import "./App.css";
import { SnackbarProvider } from "notistack";
import { Router } from "@reach/router";
import { Dictionary } from "lodash";
import actions from "./actions";
import {
  State,
  MainViewerState,
  SnackbarState,
  SnackbarKind,
  SnackbarCustomState,
  DedupperChannel
} from "./types/unistore";
import MainViewer from "./pages/MainViewer";
import Home from "./pages/Home";
import Snackbar from "./components/feedback/Snackbar";
import Channels from "./pages/Channels";

interface BaseAppProps {
  channels: DedupperChannel[];
  channelById: Dictionary<DedupperChannel>;
  updateRating: (hash: string, x: number | null) => Promise<void>;
  updateTag: (hash: string, x: number | null, name: string) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  updateChannel: (c: DedupperChannel) => Promise<void>;
  createChannel: (c: DedupperChannel) => Promise<void>;
  togglePlay: Function;
  finishSnackbar: (x: SnackbarKind) => void;
  finishSnackbarCustom: () => void;
  snackbar: SnackbarState;
  snackbarCustom: SnackbarCustomState;
  mainViewer: MainViewerState;
  unloadMainViewerImages: () => void;
  loadMainViewerImages: (channelId: string) => Promise<void>;
}
type AppProps = BaseAppProps;

const mapStateToProps =
  "channels,channelById,snackbar,snackbarCustom,mainViewer";

const App = connect<{}, {}, State, AppProps>(
  mapStateToProps,
  actions
)((props: AppProps) => (
  <SnackbarProvider maxSnack={6}>
    <div className="App">
      <Router>
        <MainViewer
          path="channel/:channelId"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...{
            ...props.mainViewer,
            updateRating: props.updateRating,
            updateTag: props.updateTag,
            togglePlay: props.togglePlay,
            unload: props.unloadMainViewerImages,
            load: props.loadMainViewerImages
          }}
        />
        <Home path="/">
          <Channels
            channels={props.channels}
            channelById={props.channelById}
            handleCreate={props.createChannel}
            handleDelete={props.deleteChannel}
            handleUpdate={props.updateChannel}
            path="channels/"
          />
        </Home>
      </Router>
      <Snackbar
        stateCustom={props.snackbarCustom}
        state={props.snackbar}
        close={props.finishSnackbar}
        closeCustom={props.finishSnackbarCustom}
      />
    </div>
  </SnackbarProvider>
));

export default App;
