/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { MouseEventHandler } from "react";
import { RenderImageProps } from "react-photo-gallery";
import { Box } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import store from "../../store";
import ViewerUtil from "../../utils/ViewerUtil";
import {
  STANDARD_WIDTH,
  STANDARD_HEIGHT
} from "../../constants/dedupperConstants";
import { ImageData } from "../../types/viewer";
import { DedupperImage } from "../../types/unistore";
import RatingAndTag from "./ui/RatingAndTag";

const selectedTransform = "translateZ(0px) scale3d(0.97, 0.97, 1)";

function isNumber(value: any): value is number {
  // eslint-disable-next-line no-restricted-globals
  return typeof value === "number" && !isNaN(value);
}
function getTransforms(_ref: ImageData) {
  const { rotate } = _ref;
  const { scaleX } = _ref;
  const { scaleY } = _ref;
  const { translateX } = _ref;
  const { translateY } = _ref;
  const values = [];

  if (isNumber(translateX) && translateX !== 0) {
    values.push("translateX(".concat(String(translateX), "px)"));
  }

  if (isNumber(translateY) && translateY !== 0) {
    values.push("translateY(".concat(String(translateY), "px)"));
  } // Rotate should come first before scale to match orientation transform

  if (isNumber(rotate) && rotate !== 0) {
    values.push("rotate(".concat(String(rotate), "deg)"));
  }

  if (isNumber(scaleX) && scaleX !== 1) {
    values.push("scaleX(".concat(String(scaleX), ")"));
  }

  if (isNumber(scaleY) && scaleY !== 1) {
    values.push("scaleY(".concat(String(scaleY), ")"));
  }

  values.push("translate3d(0, 0, 0)");

  const transform = values.length ? values.join(" ") : "none";
  return {
    // WebkitTransform: transform,
    // msTransform: transform,
    transform
  };
}

const imgWithClick = { cursor: "pointer" };
const GridPhoto = ({
  isPlay,
  index,
  currentIndex,
  image,
  selectedImage,
  unit,
  onClick,
  updateTag,
  updateRating,
  toggleSubViewer,
  photo,
  range,
  margin,
  direction,
  top,
  left
}: RenderImageProps & {
  isPlay: boolean;
  unit: number;
  range: number;
  image: DedupperImage | null;
  currentIndex: number;
  selectedImage: DedupperImage | null;
  toggleSubViewer: Function;
  updateTag: (hash: string, x: number | null, name: string) => void;
  updateRating: (hash: string, x: number | null) => void;
}) => {
  const imgStyle: React.CSSProperties = {
    boxSizing: "border-box",
    // margin,
    backgroundColor: "black",
    display: "block"
  };
  if (direction === "column") {
    imgStyle.position = "absolute";
    imgStyle.left = left;
    imgStyle.top = top;
  }
  const handleClick = (event: React.MouseEvent<Element, MouseEvent>) => {
    if (onClick) {
      onClick(event, { photo, index } as any);
    }
  };
  const createStyle = () => {
    let style: React.CSSProperties = imgStyle;
    const di = image;
    if (onClick) {
      style = { ...style, ...imgWithClick };
    }
    if (di && photo.key) {
      const aspectRatio = di.width / di.height;

      let { height } = photo;
      let { width } = photo;

      if (photo.height * aspectRatio <= photo.width) {
        height = photo.width / aspectRatio;
      } else {
        width = photo.height * aspectRatio;
      }
      let trim = {
        naturalWidth: di.width,
        naturalHeight: di.height,
        aspectRatio,
        ratio: di.width / di.width,
        width: di.width,
        height: di.height,
        left: 0,
        top: 0
        // left: (photo.width - width) / 2,
        // top: (photo.height - height) / 2
      };
      let ratio = photo.width / trim.naturalWidth;
      if (ViewerUtil.isPortraitImage()) {
        ratio = photo.height / trim.naturalHeight;
      }
      if (di.trim) {
        if (ViewerUtil.isPortraitImage()) {
          ratio = photo.height / STANDARD_WIDTH;
        } else {
          ratio = photo.width / STANDARD_WIDTH;
        }
        trim = JSON.parse(di.trim);
      }
      // const ratio = photo.width / STANDARD_WIDTH;
      const imageData = ViewerUtil.adjustImageData(trim, ratio);
      if (di.trim) {
        style.width = imageData.width;
        style.height = imageData.height;
        style.marginLeft = imageData.left;
        style.marginTop = imageData.top;
      } else {
        style.width = width;
        style.height = height;
        style.marginLeft = (photo.width - width) / 2;
        style.marginTop = (photo.height - height) / 2;
      }

      style = { ...style, ...getTransforms(imageData) };
    }
    return style;
  };
  const isSelected = !isPlay && photo.key === selectedImage?.hash;
  const isNeighbour = Math.abs(currentIndex - index) < range;
  const isShowRatingAndTag = isNeighbour && !isPlay;
  // const isVirtual = !(Math.abs(currentIndex - index) < unit * unit * 4);
  const isVirtual = false;

  const mouseDownHandler: MouseEventHandler = (event: React.MouseEvent) => {
    if (event.button === 1) {
      toggleSubViewer();
    }
    event.preventDefault();
  };
  const sizeFactor = 1.25;
  return (
    <Box id={`photo-container__${photo.key}`}>
      <Box
        overflow="hidden"
        key={photo.key}
        style={{
          transform: isSelected ? selectedTransform : "none"
          // transition:
          //   "transform .035s cubic-bezier(0.0,0.0,0.2,1), opacity linear .35s"
        }}
        width={photo.width}
        height={photo.height}
      >
        {isShowRatingAndTag ? (
          <Box
            style={{
              marginTop: "8px",
              opacity: 0.4,
              transform: `scale3d(${sizeFactor}, ${sizeFactor}, 1)`
            }}
            position="absolute"
            zIndex="1400"
            m={2}
          >
            <RatingAndTag
              currentImage={image}
              onTagChange={updateTag}
              onRatingChange={updateRating}
            />
          </Box>
        ) : null}
        {!isVirtual && isSelected ? (
          <Box zIndex={1000} position="absolute" right="0px">
            <CheckCircle
              fontSize={unit < 7 ? "large" : "default"}
              color="secondary"
            />
          </Box>
        ) : null}
        {isVirtual ? (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            style={{
              ...imgWithClick,
              width: photo.width,
              height: photo.height
            }}
            onClick={onClick ? handleClick : undefined}
            onMouseDown={mouseDownHandler}
          />
        ) : (
          <img
            decoding={isPlay ? "sync" : "async"}
            src={photo.src}
            style={createStyle()}
            onClick={onClick ? handleClick : undefined}
            onMouseDown={mouseDownHandler}
          />
        )}
      </Box>
    </Box>
  );
};
export default GridPhoto;
