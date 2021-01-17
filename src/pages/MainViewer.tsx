import React, { useEffect, useState } from "react";
import { LinearProgress, Dialog, Box } from "@material-ui/core";

import Slide from "@material-ui/core/Slide";
import { RouteComponentProps } from "@reach/router";
import "./MainViewer.css";

import ReactHotkeys from "react-hot-keys";
import { MultiImageViewer } from "../components/viewer";
import { MainViewerState, ConfigurationState } from "../types/unistore";
import DataTable from "../components/viewer/DataTable";
import RatingAndTag from "../components/viewer/ui/RatingAndTag";
import RatingAndTagHotkey from "../components/viewer/ui/RatingAndTagHotkey";
import PlayHotKey from "../components/viewer/ui/PlayHotkey";
import AutoReload from "../components/behavior/AutoReload";
import { EVENT_X_KEY } from "../constants/dedupperConstants";
import IFrameWrapper from "../components/IFrameWrapper";
import IFrameUtil from "../utils/IFrameUtil";
import ColorTuner from "../components/viewer/ui/ColorTuner";
import HudLayer from "../components/viewer/HudLayer";
import DomUtil from "../utils/DomUtil";
import FullscreenButton from "../components/FullscreenButton";

const reload = () => {
  IFrameUtil.postMessageForParent({
    type: "superReload",
    payload: null
  });
};

const applyTag = () => {
  // SubViewerHelper.dispatchCustomEventForParent(event.type);
  IFrameUtil.postMessageForParent({
    type: "forGrid",
    payload: {
      type: "customEvent",
      payload: {
        name: EVENT_X_KEY
      }
    }
  });
};

type MainViewerProps = MainViewerState & {
  configuration: ConfigurationState;
  unload: () => void;
  load: (channelId: string) => Promise<void>;
  channelId?: string;
  hash?: string;
  updateColor: (hash: string, kind: string, value: number) => void;
  updateTag: (hash: string, x: number | null, name: string) => void;
  updateRating: (hash: string, x: number | null) => void;
  togglePlay: Function;
} & RouteComponentProps;

const Transition: any = React.forwardRef(function Transition(props: any, ref) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />;
});

const MainViewer: React.SFC<MainViewerProps> = ({
  configuration: c,
  isPlay,
  load,
  unload,
  faces,
  isLoading,
  channelId,
  hash,
  currentImage,
  index,
  images,
  updateTag,
  updateRating,
  updateColor,
  togglePlay
}) => {
  useEffect(() => {
    if (hash) {
      load(hash);
    } else if (channelId) {
      load(channelId);
    }
    return () => {};
  }, [load, hash, channelId]);

  const [colorReset, setColorReset] = useState<number>(0);
  const onWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (event.deltaY > 0) {
      DomUtil.getViewerSafe()?.next(true);
    } else {
      DomUtil.getViewerSafe()?.prev(true);
    }
  };

  return (
    <>
      <HudLayer
        updateTag={updateTag}
        mode={c.showFacePP}
        disabled={isPlay}
        faces={faces}
        image={currentImage}
      />
      <AutoReload
        disabled={!c.autoReload}
        index={index}
        load={() => {
          /*
          if (channelId) {
            load(channelId);
          }
          */
          reload();
        }}
        isPlay={isPlay}
        unit={1}
        range={1}
        imageCount={images.length}
      />
      {isPlay && (
        <Box
          onWheel={onWheel}
          style={{
            opacity: 0
          }}
          onClick={() => togglePlay()}
          top="0"
          left="0"
          width={window.innerWidth}
          height={window.innerHeight}
          position="fixed"
          zIndex="1355"
          m={2}
        />
      )}
      <Box className="viewer-main-container">
        {!isPlay && (
          <Box
            onWheel={(event: React.WheelEvent<HTMLElement>) => {
              if (event.deltaY > 0) {
                DomUtil.getViewerSafe()?.next(true);
              } else {
                DomUtil.getViewerSafe()?.prev(true);
              }
            }}
            style={{ opacity: 0.4 }}
            position="fixed"
            zIndex="1355"
            m={2}
          >
            <RatingAndTag
              currentImage={currentImage}
              onTagChange={updateTag}
              onRatingChange={updateRating}
            />
          </Box>
        )}
        {!isPlay && (
          <Box
            position="fixed"
            zIndex="1355"
            m={2}
            width={200}
            right={0}
            bottom={40}
          >
            <ColorTuner
              reset={colorReset}
              image={currentImage}
              onUpdate={(k, v) => {
                if (hash) {
                  updateColor(hash, k, v);
                } else if (currentImage) {
                  updateColor(currentImage.hash, k, v);
                }
              }}
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
            configuration={c}
          />
        </Box>
        <PlayHotKey togglePlay={togglePlay} />
        <ReactHotkeys keyName="x" onKeyUp={() => applyTag()} />
        <ReactHotkeys keyName="r" onKeyUp={() => reload()} />
        <RatingAndTagHotkey
          image={currentImage}
          updateRating={updateRating}
          updateTag={updateTag}
        />
        <Dialog fullScreen open TransitionComponent={Transition}>
          {isLoading && <LinearProgress color="secondary" />}
          <MultiImageViewer
            load={async () => {
              /*
              if (channelId) {
                load(channelId);
              }
              */
              /*
              if (hash) {
                load(hash);
              }
              */
            }}
            channelId={channelId || null}
            options={{}}
            setColorReset={setColorReset}
            colorReset={colorReset}
            unload={unload}
            isPlay={isPlay}
            togglePlay={togglePlay}
            images={images}
          />
        </Dialog>
      </Box>
    </>
  );
};
const MainViewerWrapped: React.FunctionComponent<MainViewerProps> = props => (
  <>
    <FullscreenButton />
    <IFrameWrapper
      keepAspectRatio
      // eslint-disable-next-line react/destructuring-assignment
      standardHeight={props.configuration.standardHeight}
      // eslint-disable-next-line react/destructuring-assignment
      standardWidth={props.configuration.standardWidth}
      id="main-viewer-iframe"
      // eslint-disable-next-line react/destructuring-assignment
      origin={props.configuration.iframeOrigin}
    >
      <MainViewer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    </IFrameWrapper>
  </>
);
export default MainViewerWrapped;
