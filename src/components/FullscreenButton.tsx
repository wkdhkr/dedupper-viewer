import { Box, Fab } from "@material-ui/core";
import { Fullscreen, FullscreenExit } from "@material-ui/icons";
import React, { useState } from "react";
import useWindowSize from "../hooks/windowSize";
import FullscreenUtil from "../utils/FullscreenUtil";
import IFrameUtil from "../utils/IFrameUtil";

type FullscreenButtonProps = {};

const FullscreenButton: React.FunctionComponent<FullscreenButtonProps> = React.memo(
  () => {
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
          transform: "translate(-50%, -0%)",
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
            FullscreenUtil.toggleFullscreen();
          }}
          color="secondary"
        >
          {button}
        </Fab>
      </Box>
    );
  }
);

export default FullscreenButton;
