import React, { useEffect } from "react";
import { LinearProgress, Dialog, Box } from "@material-ui/core";

import Slide from "@material-ui/core/Slide";
import { RouteComponentProps } from "@reach/router";
import "./MainViewer.css";

import ReactHotkeys from "react-hot-keys";
import { MultiImageViewer } from "../components/viewer";
import { MainViewerState } from "../types/unistore";
import DataTable from "../components/viewer/DataTable";
import RatingAndTag from "../components/viewer/ui/RatingAndTag";
import RatingAndTagHotkey from "../components/viewer/ui/RatingAndTagHotkey";
import PlayHotKey from "../components/viewer/ui/PlayHotkey";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import { EVENT_X_KEY, EVENT_R_KEY } from "../store/customEventListeners";

type MainViewerProps = MainViewerState & {
  unload: () => void;
  load: (channelId: string) => Promise<void>;
  channelId?: string;
  hash?: string;
  updateTag: (hash: string, x: number | null, name: string) => void;
  updateRating: (hash: string, x: number | null) => void;
  togglePlay: Function;
} & RouteComponentProps;

const Transition: any = React.forwardRef(function Transition(props: any, ref) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />;
});

const MainViewer: React.SFC<MainViewerProps> = ({
  isPlay,
  load,
  unload,
  isLoading,
  channelId,
  hash,
  currentImage,
  index,
  images,
  updateTag,
  updateRating,
  togglePlay
}) => {
  useEffect(() => {
    if (hash) {
      load(hash);
    }
    return () => {};
  }, [hash]);
  return (
    <Box className="viewer-main-container">
      {!isPlay && (
        <Box style={{ opacity: 0.4 }} position="fixed" zIndex="1400" m={2}>
          <RatingAndTag
            currentImage={currentImage}
            onTagChange={updateTag}
            onRatingChange={updateRating}
          />
        </Box>
      )}
      <Box
        id="viewer-data-table"
        style={{ opacity: "0.0" }}
        position="fixed"
        left="6px"
        bottom="6px"
        zIndex="1400"
      >
        <DataTable
          index={index}
          imageCount={images.length}
          image={currentImage}
        />
      </Box>
      <PlayHotKey togglePlay={togglePlay} />
      <ReactHotkeys
        keyName="x"
        onKeyUp={() => {
          const w = SubViewerHelper.getParentWindow();
          const event = new CustomEvent(EVENT_X_KEY);
          w?.document.dispatchEvent(event);
        }}
      />
      <ReactHotkeys
        keyName="r"
        onKeyUp={() => {
          const w = SubViewerHelper.getParentWindow();
          const event = new CustomEvent(EVENT_R_KEY);
          w?.document.dispatchEvent(event);
        }}
      />
      <RatingAndTagHotkey
        image={currentImage}
        updateRating={updateRating}
        updateTag={updateTag}
      />
      <Dialog fullScreen open TransitionComponent={Transition}>
        {isLoading && <LinearProgress color="secondary" />}
        <MultiImageViewer
          load={async () => {
            if (channelId) {
              load(channelId);
            }
            /*
            if (hash) {
              load(hash);
            }
            */
          }}
          unload={unload}
          isPlay={isPlay}
          togglePlay={togglePlay}
          images={images}
        />
      </Dialog>
    </Box>
  );
};
export default MainViewer;
