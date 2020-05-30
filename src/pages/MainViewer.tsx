import React from "react";
import { LinearProgress, Dialog, Box } from "@material-ui/core";

import Slide from "@material-ui/core/Slide";
import { RouteComponentProps } from "@reach/router";
import "./MainViewer.css";

import { MultiImageViewer } from "../components/viewer";
import { MainViewerState } from "../types/unistore";
import DataTable from "../components/viewer/DataTable";
import RatingAndTag from "../components/viewer/ui/RatingAndTag";
import RatingAndTagHotkey from "../components/viewer/ui/RatingAndTagHotkey";

type MainViewerProps = MainViewerState & {
  unload: () => void;
  load: (channelId: string) => Promise<void>;
  channelId?: string;
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
  currentImage,
  index,
  images,
  updateTag,
  updateRating,
  togglePlay
}) => {
  return (
    <>
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
      <RatingAndTagHotkey
        image={currentImage}
        updateRating={updateRating}
        updateTag={updateTag}
      >
        <Dialog fullScreen open TransitionComponent={Transition}>
          {isLoading && <LinearProgress color="secondary" />}
          <MultiImageViewer
            load={async () => {
              if (channelId) {
                load(channelId);
              }
            }}
            unload={unload}
            isPlay={isPlay}
            togglePlay={togglePlay}
            images={images}
          />
        </Dialog>
      </RatingAndTagHotkey>
    </>
  );
};
export default MainViewer;
