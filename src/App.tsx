import React from "react";
import { connect } from "unistore/react";
import "./App.css";
import { SnackbarProvider } from "notistack";
import { Router, Redirect } from "@reach/router";
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
  DedupperImage,
  ConfigurationState,
  GestureInfo,
  ThumbSliderState,
  SortKind,
} from "./types/unistore";
import MainViewer from "./pages/MainViewer";
import GridViewer from "./pages/GridViewer";
import Home from "./pages/Home";
import Snackbar from "./components/feedback/Snackbar";
import Channels from "./pages/Channels";
import UrlUtil from "./utils/dedupper/UrlUtil";
import SubViewer from "./components/viewer/SubViewer";
import Start from "./pages/Start";
import NavigationButtonBar from "./components/NavigationButtonBar";
import ConfigurationDialog from "./components/configuration/ConfigurationDialog";
import SubViewerHelper from "./helpers/viewer/SubViewerHelper";
import IFrameUtil from "./utils/IFrameUtil";
import ThumbSlider from "./pages/ThumbSlider";

interface BaseAppProps {
  connectionCount: number;
  configuration: ConfigurationState;
  channels: DedupperChannel[];
  channelById: Dictionary<DedupperChannel>;
  setGestureInfo: (x: GestureInfo) => void;
  updateRating: (hash: string, x: number | null) => void;
  updateColor: (hash: string, kind: string, value: number) => void;
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
  changeSort: (x: SortKind, reverse: boolean) => void;
  togglePlay: Function;
  toggleGridPlay: Function;
  loadChannels: Function;
  toggleSubViewer: (close: boolean | null) => void;
  selected: (
    hash: string | null,
    mayIndex?: number | null,
    showSubViewer?: boolean
  ) => void;
  selectedByIndex: (index: number) => void;
  finishSnackbar: (x: SnackbarKind) => void;
  finishSnackbarCustom: () => void;
  imageByHash: Dictionary<DedupperImage>;
  snackbar: SnackbarState;
  snackbarCustom: SnackbarCustomState;
  gridViewer: GridViewerState;
  mainViewer: MainViewerState;
  thumbSlider: ThumbSliderState;
  updateConfiguration: (c: ConfigurationState) => void;
  unloadMainViewerImages: () => void;
  loadMainViewerImage: (hash: string) => Promise<void>;
  loadMainViewerImages: (channelId: string, silent?: boolean) => Promise<void>;
}
type AppProps = BaseAppProps;

const mapStateToProps =
  "sortKind,connectionCount,configuration,channels,channelById,snackbar,snackbarCustom," +
  "imageByHash,mainViewer,gridViewer,thumbSlider";

const App = connect<{}, {}, State, AppProps>(
  mapStateToProps,
  actions
)((props: AppProps) => {
  const isInGridViewer = UrlUtil.isInGridViewer();
  return (
    <SnackbarProvider maxSnack={2}>
      <div className="App">
        <ConfigurationDialog
          configuration={props.configuration}
          updateFn={props.updateConfiguration}
        />
        {props.configuration.enableSubViewer &&
          !IFrameUtil.isInIFrame() &&
          !SubViewerHelper.isChild() &&
          (isInGridViewer ||
            props.mainViewer.subViewer.isOpen ||
            props.gridViewer.subViewer.isOpen) && (
            <SubViewer
              isGridOpen={props.gridViewer.subViewer.isOpen}
              isMainOpen={props.mainViewer.subViewer.isOpen}
              origin={props.configuration.iframeOrigin}
              toggle={props.toggleSubViewer}
              url={!isInGridViewer ? props.mainViewer.subViewer.url : null}
              image={props.gridViewer.selectedImage}
            />
          )}
        <Router>
          <Redirect noThrow from="/" to="start/" />
          <GridViewer
            mainViewer={props.mainViewer}
            connectionCount={props.connectionCount}
            configuration={props.configuration}
            path="channel/grid/:channelId"
            setGestureInfo={props.setGestureInfo}
            updateColor={props.updateColor}
            updateRating={props.updateRating}
            updateSize={props.updateSize}
            togglePlay={props.toggleGridPlay}
            updateTag={props.updateTag}
            changeUnit={props.changeUnit}
            selected={props.selected}
            unload={props.unloadMainViewerImages}
            load={props.loadMainViewerImages}
            images={props.mainViewer.images}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.gridViewer}
          />
          <ThumbSlider
            connectionCount={props.connectionCount}
            setGestureInfo={props.setGestureInfo}
            configuration={props.configuration}
            path="thumbs/"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...{
              ...props.mainViewer,
              ...props.thumbSlider,
              selected: props.selected,
              updateSize: props.updateSize,
              updateRating: props.updateRating,
              updateTag: props.updateTag,
              updateColor: props.updateColor,
              togglePlay: props.togglePlay,
              unload: props.unloadMainViewerImages,
              load: props.loadMainViewerImage,
            }}
          />
          <MainViewer
            configuration={props.configuration}
            connectionCount={props.connectionCount}
            path="image/:hash"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...{
              ...props.mainViewer,
              selected: props.selected,
              updateSize: props.updateSize,
              updateRating: props.updateRating,
              updateTag: props.updateTag,
              updateColor: props.updateColor,
              togglePlay: () => {},
              unload: props.unloadMainViewerImages,
              load: props.loadMainViewerImage,
            }}
          />
          <MainViewer
            configuration={props.configuration}
            connectionCount={props.connectionCount}
            path="channel/:channelId"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...{
              ...props.mainViewer,
              selected: props.selected,
              updateSize: props.updateSize,
              updateRating: props.updateRating,
              updateTag: props.updateTag,
              togglePlay: props.togglePlay,
              updateColor: props.updateColor,
              unload: props.unloadMainViewerImages,
              load: props.loadMainViewerImages,
            }}
          />
          <Home path="/">
            <Start path="start/" />
            <Channels
              enableSubViewer={props.configuration.enableSubViewer}
              channels={props.channels}
              channelById={props.channelById}
              changeUnit={props.changeUnit}
              handleCreate={props.createChannel}
              handleDelete={props.deleteChannel}
              handleUpdate={props.updateChannel}
              path="channels/"
            />
          </Home>
        </Router>
        <Router>
          <NavigationButtonBar
            path="/*"
            configuration={props.configuration}
            updateConfiguration={props.updateConfiguration}
            loadChannels={props.loadChannels}
            togglePlay={() => {
              if (UrlUtil.isInMainViewer()) {
                props.togglePlay();
              } else {
                props.toggleGridPlay();
              }
            }}
            changeUnit={props.changeUnit}
            changeSort={props.changeSort}
            updateTag={props.updateTag}
            selectedByIndex={props.selectedByIndex}
            gridViewer={props.gridViewer}
            mainViewer={props.mainViewer}
          />
        </Router>
        <Snackbar
          anchorOrigin={
            UrlUtil.isInGridViewer()
              ? {
                  horizontal: "left",
                  vertical: "bottom",
                }
              : {
                  horizontal: "right",
                  vertical: "top",
                }
          }
          stateCustom={props.snackbarCustom}
          state={props.snackbar}
          close={props.finishSnackbar}
          closeCustom={props.finishSnackbarCustom}
        />
      </div>
    </SnackbarProvider>
  );
});

export default App;
