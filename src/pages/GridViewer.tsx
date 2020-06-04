import React, { useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import Hotkeys from "react-hot-keys";
import { RouteComponentProps } from "@reach/router";
import Gallery from "react-photo-gallery";
import { DedupperImage, SubViewerState } from "../types/unistore";
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
import store from "../store";
import GridViewerService from "../services/Viewer/GridViewerService";
import ViewerUtil from "../utils/ViewerUtil";
import AutoReload from "../components/behavior/AutoReload";

const gs = new GridViewerService(store);

type GridViewerProps = RouteComponentProps & {
  updateTag: (
    hash: string | string[],
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  updateSize: (hash: string, w: number, h: number) => void;
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
  subViewer,
  updateSize,
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

  return (
    <>
      <AutoReload
        index={index}
        load={() => {
          if (channelId) {
            load(channelId);
          }
        }}
        isPlay={isPlay}
        unit={unit}
        range={range}
        imageCount={fitImages.length}
      />
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
          changeUnit(ViewerUtil.detectNextUnit(sourceUnit));
        }}
      />
      <Hotkeys
        keyName="r"
        onKeyUp={() => {
          // reloading
          unload();
          if (channelId) {
            load(channelId);
          }
        }}
      />
      <Hotkeys keyName="p" onKeyUp={() => togglePlay()} />
      <Hotkeys keyName="x" onKeyUp={() => gs.applyTagForImagesInScreen()} />
      <Hotkeys
        // keyName="left,right,up,down"
        keyName="left,right,up,down"
        onKeyDown={(keyName: string, event: KeyboardEvent) => {
          event.preventDefault();
        }}
        onKeyUp={(keyName: string, event: KeyboardEvent) => {
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
        <Gallery
          renderImage={props => (
            <GridPhoto
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...{
                ...props,
                // image: props.photo.key ? imageByHash[props.photo.key] : null,
                image: fitImages[props.index],
                selectedImage,
                currentIndex: index,
                isPlay,
                range,
                unit,
                updateSize,
                updateTag,
                updateRating
              }}
            />
          )}
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
              if (photo.key === selectedImage?.hash) {
                let skip = false;
                if (subViewer.isOpen === true) {
                  // eslint-disable-next-line no-alert
                  skip = !window.confirm("close sub viewer?");
                }
                if (!skip) {
                  toggleSubViewer();
                }
              } else {
                selected(photo.key, currentIndex);
              }
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
export default GridViewer;
