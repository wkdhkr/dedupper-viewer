/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from "react";
import IFrame from "react-iframe";
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
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import useWindowSize from "../hooks/windowSize";
import AjaxProgress from "../components/viewer/ui/AjaxProgress";
import ThumbSliderUtil from "../utils/ThumbSliderUtil";
import UrlUtil from "../utils/dedupper/UrlUtil";

const reload = async () => {
  await SubViewerHelper.prepareReference();
  IFrameUtil.postMessageForParent({
    type: "superReload",
    payload: null,
  });
};

const applyTag = () => {
  IFrameUtil.postMessageForParent({
    type: "forGrid",
    payload: {
      type: "customEvent",
      payload: {
        name: EVENT_X_KEY,
      },
    },
  });
};

export type MainViewerProps = MainViewerState & {
  isInline?: boolean;
  selected: (
    hash: string | null,
    index: number,
    showSubViewer?: boolean
  ) => void;
  connectionCount: number;
  configuration: ConfigurationState;
  unload: () => void;
  load: (channelId: string) => Promise<void>;
  channelId?: string;
  hash?: string;
  updateSize: (hash: string, w: number, h: number) => void;
  updateColor: (hash: string, kind: string, value: number) => void;
  updateTag: (
    hash: string | string[],
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  updateRating: (hash: string, x: number | null) => void;
  togglePlay: Function;
} & RouteComponentProps;

const Transition: any = React.forwardRef(function Transition(props: any, ref) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />;
});

export const MainViewer: React.SFC<MainViewerProps> = ({
  isInline = false,
  configuration: c,
  connectionCount,
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
  togglePlay,
}) => {
  useEffect(() => {
    if (!UrlUtil.isInline()) {
      if (hash) {
        load(hash);
      } else if (channelId) {
        load(channelId);
      }
    }
    return () => {};
  }, [isInline, load, hash, channelId]);

  const [colorReset, setColorReset] = useState<number>(0);
  const onWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (event.deltaY > 0) {
      DomUtil.getViewerSafe()?.next(true);
    } else {
      DomUtil.getViewerSafe()?.prev(true);
    }
  };

  const onWheelInRatingAndTag = (event: React.WheelEvent<HTMLElement>) => {
    if (event.deltaY > 0) {
      DomUtil.getViewerSafe()?.next(true);
    } else {
      DomUtil.getViewerSafe()?.prev(true);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentImage) {
      updateTag(currentImage.hash, currentImage.t1 ? null : 1, "t1", true);
    }
  };

  const ratingAndTag = (
    <RatingAndTag
      currentImage={currentImage}
      onTagChange={updateTag}
      onRatingChange={updateRating}
    />
  );

  return (
    <>
      <AjaxProgress connectionCount={connectionCount} />
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
            opacity: 0,
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
          <>
            <Box
              onContextMenu={handleContextMenu}
              onWheel={onWheelInRatingAndTag}
              style={{ opacity: 0.4 }}
              position="fixed"
              zIndex="1355"
              m={2}
              right={0}
              bottom={40}
            >
              {ratingAndTag}
            </Box>
            <Box
              onContextMenu={handleContextMenu}
              onWheel={onWheelInRatingAndTag}
              style={{ opacity: 0.4 }}
              position="fixed"
              zIndex="1355"
              m={2}
            >
              {ratingAndTag}
            </Box>
            <Box
              position="fixed"
              zIndex="1355"
              m={2}
              width={200}
              right={0}
              bottom={40 + 104}
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
          </>
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

type ThumbSliderIFrameProps = MainViewerProps & { zIndex?: number | string };

export const ThumbSliderIFrame: React.FunctionComponent<ThumbSliderIFrameProps> = (
  props
) => {
  useWindowSize();
  const [thumbWidth, thumbHeight] = ThumbSliderUtil.calcThumbSliderSize(
    props.configuration.standardWidth,
    props.configuration.standardHeight
  );
  const isVertical = thumbHeight > thumbWidth;
  const orientation = UrlUtil.extractParam("o");
  const origin = props.configuration.iframeOrigin;
  const url = `${window.location.protocol}//${window.location.hostname}:${
    window.location.port
  }/thumbs?o=${orientation}&inline=${props.isInline ? "1" : "0"}`;
  const iframeUrl = new URL(url);
  iframeUrl.hostname = new URL(origin).hostname; // TODO: configuration
  return (
    <>
      {IFrameUtil.isInIFrame() ? (
        <></>
      ) : (
        <Box
          zIndex={props.zIndex ? props.zIndex : "auto"}
          position="absolute"
          top={isVertical ? 0 : window.innerHeight - thumbHeight}
          left={isVertical ? window.innerWidth - thumbWidth : 0}
          width={thumbWidth}
          height={thumbHeight}
        >
          <IFrame
            id="thumb-slider-iframe"
            // width={`${window.innerWidth}px`}
            width="100%"
            frameBorder={0}
            height="100%"
            url={iframeUrl.toString()}
          />
        </Box>
      )}
    </>
  );
};

const MainViewerWrapped: React.FunctionComponent<MainViewerProps> = (props) => {
  return (
    <>
      <FullscreenButton />
      <ThumbSliderIFrame
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      <IFrameWrapper
        keepAspectRatio
        standardHeight={props.configuration.standardHeight}
        standardWidth={props.configuration.standardWidth}
        id="main-viewer-iframe"
        origin={props.configuration.iframeOrigin}
      >
        <MainViewer
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      </IFrameWrapper>
    </>
  );
};
export default MainViewerWrapped;
