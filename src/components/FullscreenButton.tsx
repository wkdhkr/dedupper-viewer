import { Box, Fab } from "@material-ui/core";
import { Fullscreen, FullscreenExit } from "@material-ui/icons";
import React, { useState } from "react";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import useWindowSize from "../hooks/windowSize";
import IFrameUtil from "../utils/IFrameUtil";

type FullscreenButtonProps = {};

const FullscreenButton: React.FunctionComponent<FullscreenButtonProps> = () => {
  const [isHover, setIsHover] = useState(false);
  useWindowSize();

  if (IFrameUtil.isInIFrame()) {
    return <></>;
  }
  const isFullscreen = document.fullscreenElement !== null;
  const button = isFullscreen ? <FullscreenExit /> : <Fullscreen />;
  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <Box
      className="fullScreenButton"
      m={0}
      style={{
        transition: "0.2s",
        opacity: !isHover ? 0 : 0.7,
        transform: "translate(-50%, -0%)"
      }}
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => setIsHover(false)}
      top={31}
      right={10}
      zIndex="1500"
      position="fixed"
    >
      <Fab
        size="small"
        onClick={() => {
          setIsHover(false);
          const w = SubViewerHelper.getWindow();
          const parentWindow = SubViewerHelper.getParentWindow();
          if (document.fullscreenElement) {
            w?.document.exitFullscreen().catch(() => {});
            parentWindow?.document.exitFullscreen().catch(() => {});
            document.exitFullscreen().catch(() => {});
          } else {
            w?.document.documentElement.requestFullscreen().catch(() => {});
            parentWindow?.document.documentElement
              .requestFullscreen()
              .catch(() => {});
            document.body.requestFullscreen().catch(() => {});
          }
        }}
        color="secondary"
      >
        {button}
      </Fab>
    </Box>
  );
};

export default FullscreenButton;
