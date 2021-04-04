/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import IFrame from "react-iframe";
import { LinearProgress, Dialog, Box } from "@material-ui/core";

import Slide from "@material-ui/core/Slide";
import { RouteComponentProps, useLocation } from "@reach/router";
import "./MainViewer.css";

import Hotkeys from "react-hot-keys";
import { MultiImageViewer } from "../components/viewer";
import {
  MainViewerState,
  ConfigurationState,
  ThumbSliderMode,
} from "../types/unistore";
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
import TrimRotationPreview from "../components/viewer/TrimRotationPreview";
import FullscreenHotkey from "../components/viewer/ui/FullscreenHotkey";
import GestureTip from "../components/viewer/ui/GestureTip";

const reload = async () => {
  await SubViewerHelper.prepareReference();
  IFrameUtil.postMessageForParent({
    type: "superReload",
    payload: null,
  });
};

const applyTag = () => {
  const type = UrlUtil.isInSingleViewer() ? "forGrid" : "forThumbSlider";
  if (!UrlUtil.isInRecommended()) {
    IFrameUtil.postMessageForParent({
      type,
      payload: {
        type: "customEvent",
        payload: {
          name: EVENT_X_KEY,
        },
      },
    });
  }
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
  isTrimRotation,
  isInline = false,
  configuration: c,
  gestureInfo,
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
  const onWheel = async (event: React.WheelEvent<HTMLElement>) => {
    if (UrlUtil.isInSingleViewer()) {
      let isPrev = true;
      if (event.deltaY > 0) {
        isPrev = false;
      }
      await SubViewerHelper.prepareReference();
      IFrameUtil.postMessageForOther({
        type: "navigateImage",
        payload: isPrev,
      });
    } else if (event.deltaY > 0) {
      DomUtil.getViewerSafe()?.next(true);
    } else {
      DomUtil.getViewerSafe()?.prev(true);
    }
  };

  const onWheelInRatingAndTag = (event: React.WheelEvent<HTMLElement>) =>
    onWheel(event);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentImage) {
      const next = c.selectNextAfterEditInMainViewer;
      updateTag(currentImage.hash, currentImage.t1 ? null : 1, "t1", next);
    }
  };

  const ratingAndTag = (
    <RatingAndTag
      next={c.selectNextAfterEditInMainViewer}
      currentImage={currentImage}
      onTagChange={updateTag}
      onRatingChange={updateRating}
    />
  );

  return (
    <>
      <Hotkeys
        keyName="z"
        onKeyUp={() => {
          IFrameUtil.postMessage({
            type: "toolbarClicked",
            payload: {
              kind: "zoom-in",
              isContextMenu: true,
            },
          });
        }}
      />
      <Hotkeys
        keyName="q"
        onKeyUp={() => {
          IFrameUtil.postMessage({
            type: "toolbarClicked",
            payload: {
              kind: "zoom-out",
              isContextMenu: true,
            },
          });
        }}
      />
      <GestureTip disabled={!gestureInfo.image} gestureInfo={gestureInfo} />
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
            {c.showRightRatingAndTags ? (
              <Box
                onContextMenu={handleContextMenu}
                onWheel={onWheelInRatingAndTag}
                style={{ opacity: 0.5 }}
                position="fixed"
                zIndex="1355"
                m={2}
                right={0}
                bottom={40}
              >
                {ratingAndTag}
              </Box>
            ) : null}
            {c.showLeftRatingAndTags ? (
              <Box
                onContextMenu={handleContextMenu}
                onWheel={onWheelInRatingAndTag}
                style={{ opacity: 0.5 }}
                position="fixed"
                zIndex="1355"
                m={2}
              >
                {ratingAndTag}
              </Box>
            ) : null}
            <Box
              onContextMenu={handleContextMenu}
              position="fixed"
              zIndex="1355"
              m={2}
              width={200}
              right={0}
              bottom={40 + (c.showRightRatingAndTags ? 148 : 0)}
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
          onContextMenu={handleContextMenu}
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
        <Box position="fixed" left="0px" width="300px" top="0px" zIndex="1410">
          <TrimRotationPreview
            image={currentImage}
            disabled={!isTrimRotation}
          />
        </Box>
        <PlayHotKey togglePlay={togglePlay} />
        <FullscreenHotkey />
        <Hotkeys keyName="x" onKeyUp={() => applyTag()} />
        <Hotkeys keyName="r" onKeyUp={() => reload()} />
        <RatingAndTagHotkey
          image={currentImage}
          updateRating={updateRating}
          updateTag={updateTag}
        />
        <Dialog fullScreen open TransitionComponent={Transition}>
          {isLoading && <LinearProgress color="secondary" />}
          <MultiImageViewer
            load={useCallback(async () => {
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
            }, [])}
            channelId={channelId || null}
            options={useMemo(() => ({}), [])}
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

type ThumbSliderIFrameProps = MainViewerProps & {
  mode?: ThumbSliderMode;
  zIndex?: number | string;
};

export const ThumbSliderIFrame: React.FunctionComponent<ThumbSliderIFrameProps> = (
  props
) => {
  const mode = props.mode || "list";

  useWindowSize();

  const [isHover, setIsHover] = useState(false);
  const [minThumbWidth, minThumbHeight] = ThumbSliderUtil.calcThumbSliderSize(
    props.configuration.standardWidth,
    props.configuration.standardHeight
  );
  const [thumbWidth, thumbHeight] = ThumbSliderUtil.calcThumbSliderSizeForFixed(
    props.configuration.standardWidth,
    props.configuration.standardHeight
  );
  const isThumbVertical = thumbHeight > thumbWidth;
  const isVertical = UrlUtil.isPortrait();
  const orientation = UrlUtil.extractOrientation();
  const origin = props.configuration.iframeOrigin;
  const url = `${window.location.protocol}//${window.location.hostname}:${
    window.location.port
  }/thumbs?o=${orientation}&mode=${mode}&inline=${props.isInline ? "1" : "0"}`;
  const iframeUrl = new URL(url);
  iframeUrl.hostname = new URL(origin).hostname; // TODO: configuration

  let top = isVertical ? 0 : window.innerHeight - minThumbHeight;
  if (isHover) {
    top = isVertical ? 0 : window.innerHeight - thumbHeight;
  }
  let left = isVertical ? window.innerWidth - minThumbWidth : 0;
  if (isHover) {
    left = isVertical ? window.innerWidth - thumbWidth : 0;
  }
  if (isThumbVertical && left === 0) {
    left = window.innerWidth - (isHover ? thumbWidth : minThumbWidth);
  }

  useEffect(() => {
    const onMouseout = (event: MouseEvent) => {
      if (
        event.clientY <= 0 ||
        event.clientX <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        setIsHover(false);
      }
    };
    document.body.addEventListener("mouseleave", onMouseout);
    return () => document.body.removeEventListener("mouseleave", onMouseout);
  }, []);

  return (
    <>
      {IFrameUtil.isInIFrame() ? (
        <></>
      ) : (
        <Box
          style={{
            transition: "0.2s",
          }}
          onMouseOver={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          zIndex={props.zIndex ? props.zIndex : "auto"}
          position="fixed"
          top={top}
          left={left}
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
  useLocation();
  const orientation = UrlUtil.extractOrientation();
  useEffect(() => {
    if (!IFrameUtil.isInIFrame()) {
      const el = document.getElementById(
        "main-viewer-iframe"
      ) as HTMLIFrameElement | null;
      if (el) {
        const frameOrientation = UrlUtil.extractOrientation(el.src);
        if (
          orientation &&
          frameOrientation &&
          orientation !== frameOrientation
        ) {
          window.location.reload();
        }
      }
    }
  }, [orientation]);
  const isInSingleViewer = UrlUtil.isInSingleViewer();
  return (
    <>
      <FullscreenButton />
      {!isInSingleViewer ? (
        <ThumbSliderIFrame
          zIndex={1000}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      ) : (
        <ThumbSliderIFrame
          zIndex={1000}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          mode="time"
        />
      )}
      <IFrameWrapper
        keepAspectRatio
        standardHeight={props.configuration.standardHeight}
        standardWidth={props.configuration.standardWidth}
        id="main-viewer-iframe"
        origin={props.configuration.iframeOrigin}
        url={window.location.href}
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
