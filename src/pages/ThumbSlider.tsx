import React, { useEffect } from "react";
import Hotkeys from "react-hot-keys";
import { RouteComponentProps } from "@reach/router";
import Gallery from "react-photo-gallery";
import {
  DedupperImage,
  ConfigurationState,
  GestureInfo,
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
import IFrameUtil from "../utils/IFrameUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import useWindowSize from "../hooks/windowSize";
import ThumbSliderUtil from "../utils/ThumbSliderUtil";
import AjaxProgress from "../components/viewer/ui/AjaxProgress";

const gs = new GridViewerService(store);

const applyTag = () => {
  if (!UrlUtil.isInRecommend()) {
    gs.applyTagForImagesInScreen();
  }
  /*
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
  */
};
const reload = async () => {
  await SubViewerHelper.prepareReference();
  IFrameUtil.postMessageForParent({
    type: "superReload",
    payload: null,
  });
};

type ThumbSliderProps = RouteComponentProps & {
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
  updateRating: (hash: string, x: number | null) => void;
  unit?: number;
  channelId?: string;
  isPlay: boolean;
  togglePlay: Function;
  selected: (
    hash: string | null,
    mayIndex?: number | null,
    showSubViewer?: boolean
  ) => void;
  selectedImage?: DedupperImage | null;
  unload: () => void;
  index: number;
  load: (channelId: string) => Promise<void>;
  images: DedupperImage[];
};

const ThumbSlider: React.FunctionComponent<ThumbSliderProps> = ({
  gestureInfo,
  setGestureInfo,
  connectionCount,
  configuration: c,
  images,
  isPlay,
  selected,
  index,
  updateSize,
  selectedImage = null,
  togglePlay,
  updateTag,
  updateRating,
}) => {
  useWindowSize();

  const isPortraitImage = ViewerUtil.isPortraitImage();
  const range = ThumbSliderUtil.detectRange(
    selectedImage?.hash || null,
    images,
    c
  );
  const unit = ThumbSliderUtil.detectUnit(
    selectedImage?.hash || null,
    images,
    c
  );

  // const fitImages = ImageArrayUtil.fitAmountForGridUnit(images, range);
  const fitImages = images.slice();

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (!c.open) {
        event.preventDefault();
        let nextHash = null;
        if (event.deltaY > 0) {
          nextHash = ThumbSliderUtil.getNextLeftTopHash(
            images[index]?.hash || null,
            images,
            c
          );
        } else {
          nextHash = ThumbSliderUtil.getPrevLeftTopHash(
            images[index]?.hash || null,
            images,
            c
          );
        }
        if (nextHash) {
          selected(nextHash);
        }
      }
    };

    // setup scroll handler for override default behavior
    window.addEventListener("wheel", handleScroll as any, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll as any, {});
  }, [index, images, range, c, selected]);

  if (UrlUtil.isInline() && c.enableSubViewer) {
    return null;
  }

  return (
    <>
      <AjaxProgress connectionCount={connectionCount} />
      <PlayHotKey togglePlay={togglePlay} />
      <RatingAndTagHotkey
        updateTag={updateTag}
        updateRating={updateRating}
        image={selectedImage}
        next={c.selectNextAfterEditInGridViewer}
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

            selected(...ImageArrayUtil.detectDestination(fitImages, nextIndex));
          }
        }}
      />
      <Gallery
        renderImage={(props) => (
          <GridPhoto
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...{
              ...props,
              isThumbSlider: true,
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
        targetRowHeight={ThumbSliderUtil.calcTargetRowHeight(
          selectedImage?.hash || null,
          images,
          c
        )}
        // columns={range}
        // direction="column"
        photos={fitImages.map(({ hash }) => ({
          key: hash,
          width: isPortraitImage ? STANDARD_HEIGHT : STANDARD_WIDTH,
          height: isPortraitImage ? STANDARD_WIDTH : STANDARD_HEIGHT,
          src: UrlUtil.generateImageUrl(hash),
        }))}
        onClick={(event, { photo, index: currentIndex }) => {
          if (photo.key) {
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
    </>
  );
};

export default ThumbSlider;
