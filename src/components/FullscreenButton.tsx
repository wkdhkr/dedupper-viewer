import { Box, Fab } from "@material-ui/core";
import { Fullscreen, FullscreenExit } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import UrlUtil from "../utils/dedupper/UrlUtil";
import IFrameUtil from "../utils/IFrameUtil";

type FullscreenButtonProps = {};

// https://usehooks.com/useWindowSize/
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: -1,
    height: -1
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

const FullscreenButton: React.FunctionComponent<FullscreenButtonProps> = () => {
  const isPlay = UrlUtil.isPlay();
  useWindowSize();

  if (isPlay || IFrameUtil.isInIFrame()) {
    return <></>;
  }
  const isFullscreen = document.fullscreenElement !== null;
  const button = isFullscreen ? <FullscreenExit /> : <Fullscreen />;
  return (
    <Box
      m={0}
      style={{
        opacity: 0.7,
        transform: "translate(-50%, -0%)"
        // transition: "0.3s"
      }}
      top={31}
      right={10}
      zIndex="1500"
      position="fixed"
    >
      <Fab
        size="small"
        onClick={() => {
          const w = SubViewerHelper.getWindow();
          const parentWindow = SubViewerHelper.getParentWindow();
          if (document.fullscreenElement) {
            w?.document.exitFullscreen().catch((e: any) => {});
            parentWindow?.document.exitFullscreen().catch((e: any) => {});
            document.exitFullscreen().catch((e: any) => {});
          } else {
            w?.document.body.requestFullscreen().catch((e: any) => {});
            parentWindow?.document.body
              .requestFullscreen()
              .catch((e: any) => {});
            document.body.requestFullscreen().catch((e: any) => {});
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
