import React, { useEffect, useState } from "react";
import { LinearProgress, Box, IconButton } from "@material-ui/core";
import { Dictionary } from "lodash";
import Hotkeys from "react-hot-keys";
import { RouteComponentProps } from "@reach/router";
import Gallery from "react-photo-gallery";
// import PerfectScrollbar from "react-perfect-scrollbar";
import { PlayCircleOutline, Stop } from "@material-ui/icons";
import {
  DedupperImage,
  SubViewerState,
  DedupperChannel
} from "../types/unistore";
import UrlUtil from "../utils/dedupper/UrlUtil";
import "react-perfect-scrollbar/dist/css/styles.css";
import "./GridViewer.css";
import GridPhoto from "../components/viewer/GridPhoto";
import {
  STANDARD_HEIGHT,
  STANDARD_WIDTH
} from "../constants/dedupperConstants";
import RatingAndTagHotkey from "../components/viewer/ui/RatingAndTagHotkey";
import ImageArrayUtil from "../utils/ImageArrayUtil";
import PlayHotKey from "../components/viewer/ui/PlayHotkey";
import GridViewerService from "../services/Viewer/GridViewerService";
import store from "../store";
import ViewerUtil from "../utils/ViewerUtil";

const gs = new GridViewerService(store);

type GridViewerProps = RouteComponentProps & {
  updateTag: (
    hash: string | string[],
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  updateRating: (hash: string, x: number | null) => void;
  unit: number;
  subViewer: SubViewerState;
  channelId?: string;
  isPlay: boolean;
  togglePlay: Function;
  changeUnit: (x: number) => void;
  toggleSubViewer: Function;
  selected: (hash: string, index: number) => void;
  selectedImage: DedupperImage | null;
  unload: () => void;
  index: number;
  load: (channelId: string) => Promise<void>;
  images: DedupperImage[];
};

const GridViewer: React.FunctionComponent<GridViewerProps> = ({
  images,
  unit: sourceUnit,
  isPlay,
  selected,
  index,
  selectedImage,
  togglePlay,
  changeUnit,
  toggleSubViewer,
  load,
  unload,
  channelId,
  updateTag,
  updateRating
}) => {
  const [unit, range] = ViewerUtil.detectUnitAndRange(sourceUnit);
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
  }, [channelId]);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
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
    };

    // setup scroll handler for override default behavior
    window.addEventListener("wheel", handleScroll as any, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll as any, {});
  }, [index]);

  const [isPlayHover, setIsPlayHover] = useState(false);

  // const isShownPlayIcon = isPlayHover || !isPlay;
  const isShownPlayIcon = isPlayHover;
  return (
    <>
      <PlayHotKey togglePlay={togglePlay} />
      <RatingAndTagHotkey
        updateTag={updateTag}
        updateRating={updateRating}
        image={selectedImage}
      />
      <Hotkeys
        keyName="g"
        onKeyUp={(keyName: string) => {
          // grid unit change
          changeUnit(ViewerUtil.detectNextUnit(sourceUnit));
          setTimeout(() => {
            selected(...ImageArrayUtil.detectDestination(fitImages, index));
          }, 2000);
        }}
      />
      <Hotkeys
        keyName="r"
        onKeyUp={(keyName: string) => {
          // reloading
          unload();
          if (channelId) {
            load(channelId);
          }
        }}
      />
      <Hotkeys
        keyName="x"
        onKeyUp={(keyName: string) => gs.applyTagForImagesInScreen()}
      />
      <Hotkeys
        // keyName="left,right,up,down"
        keyName="left,right,up,down"
        onKeyDown={(keyName: string, event: KeyboardEvent) => {
          event.preventDefault();
        }}
        onKeyUp={(keyName: string, event: KeyboardEvent) => {
          if (fitImages.length) {
            let nextIndex = -1;
            const leftTopIndex = index - (index % range);
            if (keyName === "left") {
              nextIndex = index - 1;
            }
            if (keyName === "right") {
              nextIndex = index + 1;
            }
            if (keyName === "up") {
              nextIndex = leftTopIndex - range;
            }
            if (keyName === "down") {
              nextIndex = leftTopIndex + range;
            }

            selected(...ImageArrayUtil.detectDestination(fitImages, nextIndex));
          }
        }}
      />
      {/* <PerfectScrollbar>
      <Box
        id="grid-viewer-container"
        m={0}
        bgcolor="black"
        width={window.innerWidth}
        height={window.innerHeight}
      > */}
      {fitImages.length ? (
        <>
          <Box
            id="play-icon-container"
            style={{
              opacity: isShownPlayIcon ? 0.8 : 0,
              transform: "translate(-50%, -50%)",
              transition: "0.3s"
            }}
            position="fixed"
            top={window.innerHeight / 2}
            left="50%"
            zIndex="1400"
          >
            <IconButton
              onMouseEnter={() => setIsPlayHover(true)}
              onMouseLeave={() => setIsPlayHover(false)}
              onClick={() => togglePlay()}
            >
              {isPlay ? (
                <Stop
                  color="secondary"
                  style={{
                    fontSize: "3em"
                  }}
                />
              ) : (
                <PlayCircleOutline
                  color="secondary"
                  style={{
                    fontSize: "3em"
                  }}
                />
              )}
            </IconButton>
          </Box>
          <Gallery
            renderImage={props =>
              GridPhoto({
                ...props,
                // image: props.photo.key ? imageByHash[props.photo.key] : null,
                image: fitImages[props.index],
                selectedImage,
                currentIndex: index,
                isPlay,
                range,
                unit,
                toggleSubViewer,
                updateTag,
                updateRating
              })
            }
            margin={0}
            limitNodeSearch={unit}
            targetRowHeight={containerWidth =>
              ViewerUtil.calcTargetLowHeight(unit, containerWidth, true)
            }
            // columns={2}
            // direction="column"
            photos={fitImages.map(({ width, height, hash }) => ({
              key: hash,
              width: isPortraitImage ? STANDARD_HEIGHT : STANDARD_WIDTH,
              height: isPortraitImage ? STANDARD_WIDTH : STANDARD_HEIGHT,
              src: UrlUtil.generateImageUrl(hash)
            }))}
            onClick={(event, { photo, index: currentIndex }) => {
              if (photo.key) {
                selected(photo.key, currentIndex);
              }
            }}
          />
        </>
      ) : (
        <LinearProgress color="secondary" />
      )}
      {/* </Box>
      </PerfectScrollbar> */}
    </>
  );
};
export default GridViewer;
