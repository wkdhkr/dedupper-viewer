import React, { useEffect, useState } from "react";
import { LinearProgress, Box, IconButton } from "@material-ui/core";
import Hotkeys from "react-hot-keys";
import { RouteComponentProps } from "@reach/router";
import Gallery from "react-photo-gallery";
// import PerfectScrollbar from "react-perfect-scrollbar";
import { PlayCircleOutline, Stop } from "@material-ui/icons";
import { Dictionary } from "lodash";
import { DedupperImage } from "../types/unistore";
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

type GridViewerProps = RouteComponentProps & {
  imageByHash: Dictionary<DedupperImage>;
  updateTag: (
    hash: string | string[],
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  updateRating: (hash: string, x: number | null) => void;
  channelId?: string;
  isPlay: boolean;
  togglePlay: Function;
  selected: (hash: string, index: number) => void;
  selectedImage: DedupperImage | null;
  unload: () => void;
  index: number;
  load: (channelId: string, unit: number) => Promise<void>;
  images: DedupperImage[];
};

const GridViewer: React.FunctionComponent<GridViewerProps> = ({
  images,
  imageByHash,
  isPlay,
  selected,
  index,
  selectedImage,
  togglePlay,
  load,
  unload,
  channelId,
  updateTag,
  updateRating
}) => {
  useEffect(() => {
    // load images
    if (channelId) {
      load(channelId, 2);
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
      let finalIndex = index;
      if (event.deltaY > 0) {
        finalIndex += 1;
      } else {
        finalIndex -= 1;
      }
      if (images.length) {
        selected(...ImageArrayUtil.detectDestination(images, finalIndex));
      }
    };

    // setup scroll handler for override default behavior
    window.addEventListener("wheel", handleScroll as any, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll as any, {});
  }, [index]);

  const [isPlayHover, setIsPlayHover] = useState(false);

  const isShownPlayIcon = isPlayHover || !isPlay;

  const columnCount = 2;
  return (
    <>
      <RatingAndTagHotkey
        updateTag={updateTag}
        updateRating={updateRating}
        image={selectedImage}
      />
      <Hotkeys
        keyName="x"
        onKeyUp={(keyName: string) => {
          if (images.length) {
            const leftTopIndex = index - (index % 4);
            const hashList = images
              .slice(leftTopIndex, leftTopIndex + 4)
              .map(i => i.hash);
            selected(
              ...ImageArrayUtil.detectDestination(images, leftTopIndex + 4)
            );
            setTimeout(() => {
              updateTag(hashList, 1, "t1", false);
            });
          }
        }}
      />
      <Hotkeys
        // keyName="left,right,up,down"
        keyName="left,right,up,down"
        onKeyDown={(keyName: string, event: KeyboardEvent) => {
          event.preventDefault();
        }}
        onKeyUp={(keyName: string, event: KeyboardEvent) => {
          if (images.length) {
            let nextIndex = -1;
            const leftTopIndex = index - (index % 4);
            if (keyName === "left") {
              nextIndex = index - 1;
            }
            if (keyName === "right") {
              nextIndex = index + 1;
            }
            if (keyName === "up") {
              nextIndex = leftTopIndex - 4;
            }
            if (keyName === "down") {
              nextIndex = leftTopIndex + 4;
            }

            selected(...ImageArrayUtil.detectDestination(images, nextIndex));
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
      {images.length ? (
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
                image: images[props.index],
                selectedImage,
                currentIndex: index,
                isPlay,
                updateTag,
                updateRating
              })
            }
            margin={0}
            limitNodeSearch={columnCount - 0}
            targetRowHeight={containerWidth => STANDARD_WIDTH / columnCount}
            // columns={2}
            // direction="column"
            photos={images.map(({ width, height, hash }) => ({
              key: hash,
              width: STANDARD_HEIGHT,
              height: STANDARD_WIDTH,
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
