import React, { useState } from "react";
import * as colors from "@material-ui/core/colors";
import {
  PlayCircleOutline,
  Stop,
  Home,
  RssFeed,
  Settings,
  ViewColumn,
  Cached,
  Fullscreen,
  FullscreenExit,
  NavigateNext,
  NavigateBefore,
  Delete,
  Sort,
  Lock,
  LockOpen,
} from "@material-ui/icons";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Slide,
  Tooltip,
} from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import Close from "@material-ui/icons/Close";
import {
  GridViewerState,
  ConfigurationState,
  MainViewerState,
  SortKind,
} from "../types/unistore";
import UrlUtil from "../utils/dedupper/UrlUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import ViewerUtil from "../utils/ViewerUtil";
import DomUtil from "../utils/DomUtil";
import { EVENT_X_KEY } from "../constants/dedupperConstants";
import IFrameUtil from "../utils/IFrameUtil";
import RouterUtil from "../utils/RouterUtil";

type NavigationButtonBarProps = {
  gridViewer: GridViewerState;
  mainViewer: MainViewerState;
  configuration: ConfigurationState;
  updateConfiguration: (c: ConfigurationState) => void;
  changeUnit: (x: number) => void;
  changeSort: (x: SortKind, reverse: boolean) => void;
  selectedByIndex: (index: number) => void;
  updateTag: (
    hash: string,
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  loadChannels: Function;
  togglePlay: Function;
} & RouteComponentProps;

function useForceUpdate() {
  const [, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const NavigationButtonBar: React.FunctionComponent<NavigationButtonBarProps> = React.memo(
  ({
    gridViewer,
    mainViewer,
    configuration,
    updateConfiguration,
    changeUnit,
    changeSort,
    selectedByIndex,
    updateTag,
    loadChannels,
    togglePlay,
  }) => {
    const [sortAnchorEl, setSortAnchorEl] = React.useState<null | Element>(
      null
    );
    const closeSortMenu = () => setSortAnchorEl(null);
    const handleSortMenu = (
      e: React.MouseEvent,
      sortKind: SortKind,
      reverse = false
    ) => {
      if (e.button !== 0) {
        e.stopPropagation();
        e.preventDefault();
      }
      setSortAnchorEl(null);
      changeSort(sortKind, reverse);
    };

    const forceUpdate = useForceUpdate();
    const [isHover, setIsHover] = useState(false);
    const { isPlay: isGridViewerPlay } = gridViewer;
    const { isPlay: isMainViewerPlay } = mainViewer;

    const isInIFrame = IFrameUtil.isInIFrame();
    const isInline = UrlUtil.isInline();

    const isInThumbSlider = UrlUtil.isInThumbSlider();
    const isInGridViewer = UrlUtil.isInGridViewer();
    const isSubViewer = SubViewerHelper.isSubViewer();
    // const isParent = SubViewerHelper.isParent();
    const isInStart = UrlUtil.isInStart();
    const isInChannels = UrlUtil.isInChannels();
    const isInMainViewer = UrlUtil.isInMainViewer();
    const isInRecommended = UrlUtil.isInRecommended();
    const isPlay =
      (isInMainViewer && isMainViewerPlay) ||
      (isInGridViewer && isGridViewerPlay);
    // const isViewer = isInGridViewer || isInMainViewer || isSubViewer;

    const isShowGrid = isInGridViewer;
    const isShowReload =
      isInGridViewer || isInMainViewer || isSubViewer || isInChannels;
    const isShowT1All =
      (isInGridViewer || isSubViewer || isInMainViewer) && !isInRecommended;
    const isShowStop = isPlay && (isInGridViewer || isInMainViewer);
    const isShowPlay = !isPlay && (isInGridViewer || isInMainViewer);
    const isShowPrevNext = !isPlay && (isInGridViewer || isInMainViewer);
    const isShowHome = !isInline && !isSubViewer && !isInStart;
    const isShowChannels = !isSubViewer && !isInChannels && !isInMainViewer;
    const isShowConfig = !isInline;
    const isShowSort = isInGridViewer || isInMainViewer;
    const isShowClose = isInline;
    const isShowLock = isInline;

    /*
  const isNativeFullscreen =
    !document.fullscreenElement &&
    window.screen.height === window.innerHeight &&
    window.screen.width === window.innerWidth;
  */
    // const isShowFullscreen = !isNativeFullscreen;
    const isShowFullscreen = false;

    const buttonStyle = {
      cursor: isHover ? "pointer" : "default",
      fontSize: "2em",
    };
    if (!isInIFrame && !isInChannels && !isInStart) {
      return null;
    }

    if (configuration.open) {
      return null;
    }

    if (isInThumbSlider) {
      return null;
    }

    const navigateImage = (isPrev = false) => {
      if (isInGridViewer) {
        selectedByIndex(gridViewer.index + (isPrev ? -1 : 1));
      }
      if (isInMainViewer) {
        if (isPrev) {
          DomUtil.getViewerSafe()?.prev(true);
        } else {
          DomUtil.getViewerSafe()?.next(true);
        }
      }
    };

    return (
      <Box
        onWheel={(e: React.WheelEvent) => {
          e.preventDefault();
          if (e.deltaY > 0) {
            navigateImage();
          } else {
            navigateImage(true);
          }
        }}
        onContextMenu={(event: React.MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const image = isInMainViewer
            ? mainViewer.currentImage
            : gridViewer.selectedImage;
          if (image) {
            updateTag(image.hash, image.t1 ? null : 1, "t1", isInMainViewer);
          }
        }}
        textAlign="center"
        m={0}
        style={{
          opacity: isHover ? 0.8 : 0,
          transform: "translate(-50%, -0%)",
          // transition: "0.3s"
        }}
        id="navigation-button-bar-container"
        position="fixed"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        // onClick={() => setIsHover(false)}
        bottom={40}
        left="50%"
        zIndex="1500"
      >
        <Slide direction="up" in={isHover}>
          <Paper elevation={3}>
            <Box m={0} whiteSpace="nowrap">
              {isShowConfig ? (
                <Tooltip title="configuration">
                  <IconButton
                    onClick={() => {
                      setIsHover(false);
                      updateConfiguration({
                        ...configuration,
                        open: true,
                      });
                    }}
                  >
                    <Settings color="primary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowChannels ? (
                <Tooltip title="channels">
                  <IconButton
                    onClick={() => RouterUtil.navigateForParent("/channels")}
                  >
                    <RssFeed color="primary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowHome ? (
                <Tooltip title="home">
                  <IconButton
                    onClick={() => RouterUtil.navigateForParent("/start")}
                  >
                    <Home color="primary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowClose ? (
                <Tooltip title="close">
                  <IconButton
                    onClick={() =>
                      IFrameUtil.postMessageForParent({
                        type: "forAllWithParent",
                        payload: {
                          type: "showMainViewer",
                          payload: false,
                        },
                      })
                    }
                  >
                    <Close color="primary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowLock ? (
                <Tooltip title="lock viewer mode">
                  <IconButton
                    onClick={() =>
                      updateConfiguration({
                        ...configuration,
                        lockInlineViewer: !configuration.lockInlineViewer,
                      })
                    }
                  >
                    {configuration.lockInlineViewer ? (
                      <Lock color="primary" style={buttonStyle} />
                    ) : (
                      <LockOpen color="primary" style={buttonStyle} />
                    )}
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowPrevNext ? (
                <Tooltip title="prev">
                  <IconButton onClick={() => navigateImage(true)}>
                    <NavigateBefore
                      color="secondary"
                      style={{ ...buttonStyle }}
                    />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowStop ? (
                <Tooltip title="stop play">
                  <IconButton onClick={() => togglePlay()}>
                    <Stop color="secondary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowPlay ? (
                <Tooltip title="play">
                  <IconButton onClick={() => togglePlay()}>
                    <PlayCircleOutline color="secondary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowPrevNext ? (
                <Tooltip title="next">
                  <IconButton onClick={() => navigateImage()}>
                    <NavigateNext
                      color="secondary"
                      style={{ ...buttonStyle }}
                    />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowGrid ? (
                <Tooltip title="change column count">
                  <IconButton
                    onClick={() => {
                      changeUnit(ViewerUtil.detectNextUnit(gridViewer.unit));
                    }}
                  >
                    <ViewColumn color="secondary" style={buttonStyle} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowT1All ? (
                <Tooltip title="apply delete tag to the displayed images">
                  <IconButton
                    onClick={() => {
                      if (isSubViewer && UrlUtil.isInSingleViewer()) {
                        IFrameUtil.postMessageForParent({
                          type: "forGrid",
                          payload: {
                            type: "customEvent",
                            payload: {
                              name: EVENT_X_KEY,
                            },
                          },
                        });
                      } else if (UrlUtil.isInMainViewer()) {
                        IFrameUtil.postMessageForParent({
                          type: "forThumbSlider",
                          payload: {
                            type: "customEvent",
                            payload: {
                              name: EVENT_X_KEY,
                            },
                          },
                        });
                      } else {
                        const event = new CustomEvent(EVENT_X_KEY);
                        window.document.dispatchEvent(event);
                      }
                    }}
                  >
                    <Delete
                      style={{
                        color: colors.red.A400,
                        ...buttonStyle,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowSort ? (
                <Tooltip title="sort">
                  <IconButton
                    onClick={(event: React.MouseEvent) => {
                      setSortAnchorEl(event.currentTarget);
                    }}
                  >
                    <Sort
                      color="secondary"
                      style={{
                        ...buttonStyle,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Menu
                id="sort-menu"
                anchorEl={sortAnchorEl}
                keepMounted
                open={Boolean(sortAnchorEl)}
                onClose={closeSortMenu}
              >
                {([
                  "file_name",
                  "file_path",
                  "file_size",
                  "rating",
                  "sexy",
                  "porn",
                  "porn_sexy",
                  "neutral",
                  "hentai_sexy",
                  "hentai_porn_sexy",
                  "hentai_porn",
                  "hentai",
                  "drawing",
                  "timestamp",
                  "width",
                  "height",
                  "resolution",
                  "view_count",
                  "view_date",
                  "delete",
                  "reviewed",
                  "random",
                ] as SortKind[]).map((k) => (
                  <MenuItem
                    key={k}
                    onClick={(e) => handleSortMenu(e, k)}
                    onContextMenu={(e) => handleSortMenu(e, k, true)}
                  >
                    {k}
                  </MenuItem>
                ))}
              </Menu>
              {isShowReload ? (
                <Tooltip title="reload">
                  <IconButton
                    onClick={async () => {
                      if (isInChannels) {
                        loadChannels();
                      } else {
                        /*
                      SubViewerHelper.reloadParentWithHeap(
                        configuration.maxJSHeapSize
                      );
                      */
                        await SubViewerHelper.prepareReference();
                        IFrameUtil.postMessageForParent({
                          type: "superReload",
                          payload: null,
                        });
                      }
                    }}
                  >
                    <Cached
                      color="secondary"
                      style={{
                        ...buttonStyle,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              ) : null}
              {isShowFullscreen ? (
                <Tooltip title="fullscreen">
                  <IconButton
                    onClick={() => {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        document.documentElement.requestFullscreen();
                      }
                      forceUpdate();
                    }}
                  >
                    {document.fullscreenElement ? (
                      <FullscreenExit
                        color="secondary"
                        style={{
                          ...buttonStyle,
                        }}
                      />
                    ) : (
                      <Fullscreen
                        color="secondary"
                        style={{ ...buttonStyle }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              ) : null}
            </Box>
          </Paper>
        </Slide>
      </Box>
    );
  },
  (p, n) => {
    const prevGridHash = p.gridViewer.selectedImage?.hash;
    const nextGridHash = n.gridViewer.selectedImage?.hash;
    const prevMainHash = p.mainViewer.currentImage?.hash;
    const nextMainHash = n.mainViewer.currentImage?.hash;
    if (
      p.gridViewer.isPlay !== n.gridViewer.isPlay ||
      p.gridViewer.unit !== n.gridViewer.unit ||
      p.gridViewer.selectedImage !== n.gridViewer.selectedImage ||
      prevGridHash !== nextGridHash ||
      prevMainHash !== nextMainHash ||
      p.configuration !== n.configuration
    ) {
      return false;
    }
    return true;
  }
);

export default NavigationButtonBar;
