import React, { useState } from "react";
import * as colors from "@material-ui/core/colors";
import {
  PlayCircleOutline,
  Stop,
  Home,
  RssFeed,
  Settings,
  ViewColumn,
  Label,
  Cached
} from "@material-ui/icons";
import { Box, IconButton, Paper, Slide } from "@material-ui/core";
import { navigate } from "@reach/router";
import { GridViewerState } from "../types/unistore";
import UrlUtil from "../utils/dedupper/UrlUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import ViewerUtil from "../utils/ViewerUtil";
import { EVENT_X_KEY, EVENT_R_KEY } from "../store/customEventListeners";

type NavigationButtonBarProps = {
  gridViewer: GridViewerState;
  changeUnit: (x: number) => void;
  selected: (hash: string, index: number) => void;
  loadChannels: Function;
  togglePlay: Function;
};

const NavigationButtonBar: React.FunctionComponent<NavigationButtonBarProps> = ({
  gridViewer,
  changeUnit,
  loadChannels,
  togglePlay
}) => {
  const [isHover, setIsHover] = useState(false);
  const { isPlay } = gridViewer;
  const isInGridViewer = UrlUtil.isInGridViewer();

  const isSubViewer = SubViewerHelper.isSubViewer();
  const isInStart = UrlUtil.isInStart();
  const isInChannels = UrlUtil.isInChannels();
  const isInMainViewer = UrlUtil.isInMainViewer();

  const isShowGrid = isInGridViewer;
  const isShowReload =
    isInGridViewer || isInMainViewer || isSubViewer || isInChannels;
  const isShowT1All = isInGridViewer || isSubViewer;
  const isShowStop = isPlay && isInGridViewer;
  const isShowPlay = !isPlay && isInGridViewer;
  const isShowHome = !isSubViewer && !isInStart;
  const isShowChannels = !isSubViewer && !isInChannels;
  const isShowConfig = true;

  const buttonStyle = {
    cursor: isHover ? "pointer" : "default",
    fontSize: "3em"
  };

  return (
    <Box
      textAlign="center"
      m={1}
      style={{
        opacity: isHover ? 0.8 : 0,
        transform: "translate(-50%, -0%)",
        fontSize: "3em"
        // transition: "0.3s"
      }}
      id="navigation-button-bar-container"
      position="fixed"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      // onClick={() => setIsHover(false)}
      bottom={0}
      left="50%"
      zIndex="1500"
    >
      <Slide direction="up" in={isHover}>
        <Paper elevation={3}>
          <Box m={1}>
            {isShowConfig ? (
              <IconButton onClick={() => {}}>
                <Settings color="primary" style={buttonStyle} />
              </IconButton>
            ) : null}
            {isShowChannels ? (
              <IconButton onClick={() => navigate("/channels")}>
                <RssFeed color="primary" style={buttonStyle} />
              </IconButton>
            ) : null}
            {isShowHome ? (
              <IconButton onClick={() => navigate("/start")}>
                <Home color="primary" style={buttonStyle} />
              </IconButton>
            ) : null}
            {isShowStop ? (
              <IconButton onClick={() => togglePlay()}>
                <Stop color="secondary" style={buttonStyle} />
              </IconButton>
            ) : null}
            {isShowPlay ? (
              <IconButton onClick={() => togglePlay()}>
                <PlayCircleOutline color="secondary" style={buttonStyle} />
              </IconButton>
            ) : null}
            {isShowGrid ? (
              <IconButton
                onClick={() => {
                  changeUnit(ViewerUtil.detectNextUnit(gridViewer.unit));
                }}
              >
                <ViewColumn color="secondary" style={buttonStyle} />
              </IconButton>
            ) : null}
            {isShowT1All ? (
              <IconButton
                onClick={() => {
                  const event = new CustomEvent(EVENT_X_KEY);
                  if (isSubViewer) {
                    SubViewerHelper.dispatchCustomEventForParent(event.type);
                  } else {
                    window.document.dispatchEvent(event);
                  }
                }}
              >
                <Label
                  style={{
                    color: colors.red.A400,
                    ...buttonStyle
                  }}
                />
              </IconButton>
            ) : null}
            {isShowReload ? (
              <IconButton
                onClick={() => {
                  if (isInChannels) {
                    loadChannels();
                  } else if (isSubViewer) {
                    SubViewerHelper.dispatchCustomEventForParent(EVENT_R_KEY);
                  } else {
                    window.document.dispatchEvent(new CustomEvent(EVENT_R_KEY));
                  }
                }}
              >
                <Cached
                  color="secondary"
                  style={{
                    ...buttonStyle
                  }}
                />
              </IconButton>
            ) : null}
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
};

export default NavigationButtonBar;
