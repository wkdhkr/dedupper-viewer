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
  DedupperChannel,
  GridViewerState,
  DedupperImage
} from "./types/unistore";
import MainViewer from "./pages/MainViewer";
import GridViewer from "./pages/GridViewer";
import Home from "./pages/Home";
import Snackbar from "./components/feedback/Snackbar";
import Channels from "./pages/Channels";
import UrlUtil from "./utils/dedupper/UrlUtil";
import SubViewer from "./components/viewer/SubViewer";

interface BaseAppProps {
  channels: DedupperChannel[];
  channelById: Dictionary<DedupperChannel>;
  updateRating: (hash: string, x: number | null) => void;
  updateSize: (hash: string, w: number, h: number) => void;
  updateTag: (
    hash: string | string[],
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  deleteChannel: (id: string) => Promise<void>;
  updateChannel: (c: DedupperChannel) => Promise<void>;
  createChannel: (c: DedupperChannel) => Promise<void>;
  changeUnit: (x: number) => void;
  togglePlay: Function;
  toggleGridPlay: Function;
  toggleSubViewer: (close: boolean | null) => void;
  selected: (hash: string, index: number) => void;
  finishSnackbar: (x: SnackbarKind) => void;
  finishSnackbarCustom: () => void;
  imageByHash: Dictionary<DedupperImage>;
  snackbar: SnackbarState;
  snackbarCustom: SnackbarCustomState;
  gridViewer: GridViewerState;
  mainViewer: MainViewerState;
  unloadMainViewerImages: () => void;
  loadMainViewerImage: (hash: string) => Promise<void>;
  loadMainViewerImages: (channelId: string) => Promise<void>;
}
type AppProps = BaseAppProps;

const mapStateToProps =
  "channels,channelById,snackbar,snackbarCustom," +
  "imageByHash,mainViewer,gridViewer";

const App = connect<{}, {}, State, AppProps>(
  mapStateToProps,
  actions
)((props: AppProps) => (
  <SnackbarProvider maxSnack={2}>
    <div className="App">
      <SubViewer
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...props.gridViewer.subViewer}
        toggle={props.toggleSubViewer}
        image={props.gridViewer.selectedImage}
      />
      <Router>
        <GridViewer
          path="channel/grid/:channelId"
          updateRating={props.updateRating}
          updateSize={props.updateSize}
          togglePlay={props.toggleGridPlay}
          toggleSubViewer={props.toggleSubViewer}
          updateTag={props.updateTag}
          changeUnit={props.changeUnit}
          selected={props.selected}
          unload={props.unloadMainViewerImages}
          load={props.loadMainViewerImages}
          images={props.mainViewer.images}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props.gridViewer}
        />
        <MainViewer
          path="image/:hash"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...{
            ...props.mainViewer,
            updateRating: props.updateRating,
            updateTag: props.updateTag,
            togglePlay: () => {},
            unload: props.unloadMainViewerImages,
            load: props.loadMainViewerImage
          }}
        />
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
        anchorOrigin={
          UrlUtil.isInGridViewer()
            ? {
                horizontal: "left",
                vertical: "bottom"
              }
            : {
                horizontal: "right",
                vertical: "top"
              }
        }
        stateCustom={props.snackbarCustom}
        state={props.snackbar}
        close={props.finishSnackbar}
        closeCustom={props.finishSnackbarCustom}
      />
    </div>
  </SnackbarProvider>
));

export default App;
