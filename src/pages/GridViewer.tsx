import React, { useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import Hotkeys from "react-hot-keys";
import { RouteComponentProps } from "@reach/router";
import Gallery from "react-photo-gallery";
import {
  DedupperImage,
  ConfigurationState,
  GestureInfo,
  MainViewerState,
} from "../types/unistore";
import UrlUtil from "../utils/dedupper/UrlUtil";
import "./GridViewer.css";
import GridPhoto from "../components/viewer/GridPhoto";
import {
  STANDARD_HEIGHT,
  STANDARD_WIDTH,
} from "../constants/dedupperConstants";
import RatingAndTagHotkey from "../components/viewer/ui/RatingAndTagHotkey";
import ImageArrayUtil from "../utils/ImageArrayUtil";
import PlayHotKey from "../components/viewer/ui/PlayHotkey";
import store from "../store";
import GridViewerService from "../services/Viewer/GridViewerService";
import ViewerUtil from "../utils/ViewerUtil";
import AutoReload from "../components/behavior/AutoReload";
import IFrameUtil from "../utils/IFrameUtil";
import IFrameWrapper from "../components/IFrameWrapper";
import FullscreenButton from "../components/FullscreenButton";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import AjaxProgress from "../components/viewer/ui/AjaxProgress";
import { MainViewer, MainViewerProps, ThumbSliderIFrame } from "./MainViewer";

const gs = new GridViewerService(store);

const applyTag = () => {
  gs.applyTagForImagesInScreen();
};
const reload = async () => {
  await SubViewerHelper.prepareReference();
  IFrameUtil.postMessageForParent({
    type: "superReload",
    payload: null,
  });
};
type GridViewerProps = RouteComponentProps & {
  showMainViewer: boolean;
  mainViewer: MainViewerState;
  gestureInfo: GestureInfo;
  setGestureInfo: (x: GestureInfo) => void;
  connectionCount: number;
  configuration: ConfigurationState;
  updateTag: (
    hash: string | string[],
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  updateSize: (hash: string, w: number, h: number) => void;
  updateColor: (hash: string, kind: string, value: number) => void;
  updateRating: (hash: string, x: number | null) => void;
  unit: number;
  channelId?: string;
  isPlay: boolean;
  togglePlay: Function;
  changeUnit: (x: number) => void;
  selected: (
    hash: string | null,
    index: number,
    showSubViewer?: boolean
  ) => void;
  selectedImage: DedupperImage | null;
  unload: () => void;
  index: number;
  load: (channelId: string) => Promise<void>;
  images: DedupperImage[];
};

const GridViewer: React.FunctionComponent<GridViewerProps> = ({
  showMainViewer,
  gestureInfo,
  setGestureInfo,
  connectionCount,
  configuration: c,
  images,
  unit,
  isPlay,
  selected,
  index,
  updateSize,
  selectedImage,
  togglePlay,
  changeUnit,
  load,
  unload,
  channelId,
  updateTag,
  updateRating,
}) => {
  const range = ViewerUtil.detectRange(unit);
  // console.log(unit, range);
  const isPortraitImage = ViewerUtil.isPortraitImage();

  const fitImages = ImageArrayUtil.fitAmountForGridUnit(images, range);

  useEffect(() => {
    // load images
    if (channelId) {
      load(channelId);
    }

    // setup play mode
    const params = new URLSearchParams(window.location.search);
    if (params.get("play")) {
      togglePlay();
    }

    return () => {
      unload();
      if (isPlay) {
        togglePlay();
      }
    };
  }, [channelId, togglePlay, load, unload, isPlay]);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (!c.open && !showMainViewer) {
        event.preventDefault();
        const leftTopIndex = index - (index % range);
        let nextIndex = index;
        if (event.deltaY > 0) {
          nextIndex = leftTopIndex + range;
        } else {
          nextIndex = leftTopIndex - range;
        }
        if (fitImages.length) {
          selected(...ImageArrayUtil.detectDestination(fitImages, nextIndex));
        }
      }
    };

    // setup scroll handler for override default behavior
    window.addEventListener("wheel", handleScroll as any, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll as any, {});
  }, [index, c.open, fitImages, range, selected, showMainViewer]);

  return (
    <>
      <AjaxProgress connectionCount={connectionCount} />
      <AutoReload
        disabled={!c.autoReload}
        index={index}
        load={() => {
          if (channelId) {
            load(channelId);
          }
          // reload();
        }}
        isPlay={isPlay}
        unit={unit}
        range={range}
        imageCount={fitImages.length}
      />
      {showMainViewer ? (
        <></>
      ) : (
        <>
          <PlayHotKey togglePlay={togglePlay} />
          <RatingAndTagHotkey
            updateTag={updateTag}
            updateRating={updateRating}
            image={selectedImage}
          />
          <Hotkeys
            keyName="g"
            onKeyUp={() => {
              // grid unit change
              changeUnit(ViewerUtil.detectNextUnit(unit));
            }}
          />
          <Hotkeys
            keyName="r"
            onKeyUp={() => {
              reload();
              // reloading
              /*
          unload();
          if (channelId) {
            load(channelId);
          }
          */
            }}
          />
          <Hotkeys keyName="p" onKeyUp={() => togglePlay()} />
          <Hotkeys keyName="x" onKeyUp={() => applyTag()} />
          <Hotkeys
            // keyName="left,right,up,down"
            allowRepeat
            keyName="left,right,up,down"
            onKeyDown={(keyName: string, event: KeyboardEvent) => {
              event.preventDefault();
            }}
            onKeyUp={(keyName: string) => {
              if (fitImages.length) {
                let nextIndex = -1;
                // const leftTopIndex = index - (index % range);
                if (keyName === "left") {
                  nextIndex = index - 1;
                }
                if (keyName === "right") {
                  nextIndex = index + 1;
                }
                if (keyName === "up") {
                  // nextIndex = leftTopIndex - range;
                  nextIndex = index - unit;
                }
                if (keyName === "down") {
                  // nextIndex = leftTopIndex + range;
                  nextIndex = index + unit;
                }

                selected(
                  ...ImageArrayUtil.detectDestination(fitImages, nextIndex)
                );
              }
            }}
          />
        </>
      )}
      {/* <PerfectScrollbar>
      <Box
        id="grid-viewer-container"
        m={0}
        bgcolor="black"
        width={window.innerWidth}
        height={window.innerHeight}
      > */}
      {fitImages.length ? (
        <Gallery
          renderImage={(props) => (
            <GridPhoto
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...{
                ...props,
                gestureInfo,
                setGestureInfo,
                // image: props.photo.key ? imageByHash[props.photo.key] : null,
                image: fitImages[props.index],
                range,
                selectedImage,
                currentIndex: index,
                isPlay,
                unit,
                updateSize,
                updateTag,
                updateRating,
              }}
            />
          )}
          margin={0}
          limitNodeSearch={unit}
          targetRowHeight={(containerWidth) =>
            ViewerUtil.calcTargetRowHeight(unit, containerWidth, true)
          }
          // columns={2}
          // direction="column"
          photos={fitImages.map(({ hash }) => ({
            key: hash,
            width: isPortraitImage ? STANDARD_HEIGHT : STANDARD_WIDTH,
            height: isPortraitImage ? STANDARD_WIDTH : STANDARD_HEIGHT,
            src: UrlUtil.generateImageUrl(hash),
          }))}
          onClick={(event, { photo, index: currentIndex }) => {
            if (photo.key) {
              if (
                event.button === 0 &&
                index === currentIndex &&
                !c.enableSubViewer
              ) {
                if (
                  selectedImage &&
                  selectedImage.hash === images[index]?.hash
                ) {
                  IFrameUtil.postMessageForParent({
                    type: "forAllWithParent",
                    payload: {
                      type: "showMainViewer",
                      payload: true,
                    },
                  });
                }
              }
              /*
              if (photo.key === selectedImage?.hash) {
                // let skip = false;
                // if (subViewer.isOpen === true) {
                //   // eslint-disable-next-line no-alert
                //   skip = !window.confirm("close sub viewer?");
                // }
                // if (!skip) {
                // }
                if (subViewer.isOpen === true) {
                  const w = SubViewerHelper.getWindow();
                  w?.focus();
                } else {
                  toggleSubViewer();
                }
              } else {
                selected(photo.key, currentIndex);
              }
              */
              selected(photo.key, currentIndex, true);

              // setTimeout(() => toggleSubViewer());
            }
          }}
        />
      ) : (
        <LinearProgress color="secondary" />
      )}
      {/* </Box>
      </PerfectScrollbar> */}
    </>
  );
};

const GridViewerWrapped: React.FunctionComponent<GridViewerProps> = (props) => {
  const mainViewerProps: MainViewerProps = {
    ...props.mainViewer,
    ...props,
  };

  const mainViewerForceTop = props.showMainViewer ? 0 : -9999;

  const isInIFrame = IFrameUtil.isInIFrame();

  return (
    <>
      <FullscreenButton />
      <IFrameWrapper
        id="grid-viewer-iframe"
        // eslint-disable-next-line react/destructuring-assignment
        origin={props.configuration.iframeOrigin}
      >
        <GridViewer
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      </IFrameWrapper>
      {isInIFrame ? (
        <></>
      ) : (
        <>
          <ThumbSliderIFrame
            zIndex={mainViewerForceTop || "auto"}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...{ ...mainViewerProps, isInline: true }}
          />
          <IFrameWrapper
            forceTop={mainViewerForceTop}
            keepAspectRatio
            // eslint-disable-next-line react/destructuring-assignment
            standardHeight={props.configuration.standardHeight}
            // eslint-disable-next-line react/destructuring-assignment
            standardWidth={props.configuration.standardWidth}
            id="main-viewer-iframe"
            url={window.location.href.replace("grid/", "") + "&inline=1"}
            // eslint-disable-next-line react/destructuring-assignment
            origin={props.configuration.iframeOrigin}
          >
            {props.configuration.enableSubViewer ? (
              <></>
            ) : (
              <MainViewer
                path="channel/:channelId"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...{
                  ...mainViewerProps,
                  isInline: true,
                  unload: props.unload,
                  load: props.load,
                }}
              />
            )}
          </IFrameWrapper>
        </>
      )}
    </>
  );
};
export default GridViewerWrapped;
