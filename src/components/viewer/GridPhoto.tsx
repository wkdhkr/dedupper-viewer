/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { MouseEventHandler, useEffect } from "react";
import omit from "lodash/omit";
import { shallowEqual } from "shallow-equal-object";
import { RenderImageProps } from "react-photo-gallery";
import { Box } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import store from "../../store";
import ViewerUtil from "../../utils/ViewerUtil";
import { STANDARD_WIDTH } from "../../constants/dedupperConstants";
import { DedupperImage, GestureInfo } from "../../types/unistore";
import RatingAndTag from "./ui/RatingAndTag";
import GridViewerService from "../../services/Viewer/GridViewerService";
import ColorUtil from "../../utils/ColorUtil";
import useWindowSize from "../../hooks/windowSize";
import PerformanceUtil from "../../utils/PerformanceUtil";

const selectedTransform = "translateZ(0px) scale3d(0.97, 0.97, 1)";

const gs = new GridViewerService(store);

let currentHover: string | null = null;

const imgWithClick = { cursor: "pointer" };
const GridPhoto = React.memo(
  ({
    isThumbSlider,
    gestureInfo,
    setGestureInfo,
    range,
    currentIndex,
    isPlay,
    index,
    image,
    selectedImage,
    unit,
    photo,
    updateSize,
    onClick,
    updateTag,
    updateRating,
    direction,
    top,
    left
  }: RenderImageProps & {
    isThumbSlider?: boolean;
    range: number;
    isPlay: boolean;
    unit: number;
    image: DedupperImage;
    currentIndex: number;
    selectedImage: DedupperImage | null;
    gestureInfo: GestureInfo;
    setGestureInfo: (x: GestureInfo) => void;
    updateSize: (hash: string, w: number, h: number) => void;
    updateTag: (
      hash: string,
      x: number | null,
      name: string,
      next?: boolean
    ) => void;
    updateRating: (hash: string, x: number | null, next?: boolean) => void;
  }) => {
    // const isNeighbour = Math.abs(currentIndex - index) < range;

    useWindowSize();

    useEffect(() => {
      const isNeighbour =
        currentIndex - range - range < index &&
        index < currentIndex + range + range;
      if (isNeighbour) {
        PerformanceUtil.decodeImage(image.hash);
      }
      /*
      if (UrlUtil.isInThumbSlider() && currentIndex === index) {
        setTimeout(() => {
          const el = document.getElementById(`photo-container__${image.hash}`);
          // WindowUtil.scrollTo(el, false);
          if (el) {
            el.scrollIntoView();
          }
        });
      }
      */
    }, [image, isThumbSlider, currentIndex, range]);

    /*
    useEffect(() => {
      if (isNeighbour) {
        const el: HTMLElement | null = document.getElementById(
          `photo-image__${photo.key}`
        );
        if (el) {
          setTimeout(async () => {
            try {
              const img: HTMLImageElement = el as any;
              if (img.complete) {
                // await img.decode();
              }
              const dummyImage = new Image();
              dummyImage.src = img.src;
              await dummyImage.decode();
            } catch (e) {
              // ignore decode error
              console.log(e);
            }
          });
        }
      }
    }, [isNeighbour, currentIndex, photo.key]);
    */

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

    /*
    const createPredecodeStyle = () => {
      const styles: React.CSSProperties = {};
      const leftTopIndex = currentIndex - (currentIndex % range);
      const isNextPageIndex =
        leftTopIndex + range + unit <= index &&
        index < leftTopIndex + range * 2;
      if (isNextPageIndex) {
        styles.position = "fixed";
        styles.top = window.innerHeight + 1;
        styles.left = window.innerWidth + 1;
        styles.marginLeft = 0;
        styles.marginTop = 0;
        styles.pointerEvents = "none";
        styles.transform = "none";
        styles.zIndex = -1000;
      }
      return styles;
    };
    */

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

        // avoid 1 pixel margin
        style.width += 1;
        style.height += 1;

        style = {
          ...style,
          ...ViewerUtil.getTransforms(imageData),
          filter: ColorUtil.createFilter(imageData)
          // ...createPredecodeStyle()
        };
      }
      return style;
    };
    const isSelected = !isPlay && photo.key === selectedImage?.hash;
    // const isShowRatingAndTag = isNeighbour && !isPlay;
    const isNeighbour =
      currentIndex - range - range < index &&
      index < currentIndex + range + range;
    const isBigArea = photo.height > 120 && photo.width > 160;
    const isShowRatingAndTag = isNeighbour && !isPlay && isBigArea;
    // const isVirtual = !(Math.abs(currentIndex - index) < unit * unit * 4);
    const isVirtual = false;

    // const decoding = isPlay || isNeighbour ? "sync" : "async";
    // const decoding = isNeighbour ? "sync" : "async";

    const handleContextMenu = (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      updateTag(image.hash, image.t1 ? null : 1, "t1", false);
    };

    const mouseDownHandler: MouseEventHandler = (event: React.MouseEvent) => {
      if (event.button === 1) {
        gs.applyTagForImagesInScreen();
        event.preventDefault();
      } else {
        setGestureInfo({ image, x: event.clientX, y: event.clientY });
      }
    };
    const handleWheel = () => {
      currentHover = null;
    };
    const onMouseEnter = (event: any) => {
      if (!isPlay) {
        currentHover = photo.key || null;
        setTimeout(() => {
          if (currentHover === photo.key) {
            handleClick(event);
          }
        }, 500);
      }
    };
    const onMouseLeave = () => {
      if (currentHover === photo.key) {
        currentHover = null;
      }
    };

    const sizeFactor = 1.25;
    return (
      <Box id={`photo-container__${photo.key}`} key={photo.key}>
        <Box
          overflow="hidden"
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
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onMouseDown={mouseDownHandler}
              onContextMenu={handleContextMenu}
              style={{
                marginTop: "8px",
                opacity: 0.4,
                transform: `scale3d(${sizeFactor}, ${sizeFactor}, 1)`
              }}
              position="absolute"
              zIndex="1355"
              m={2}
            >
              <RatingAndTag
                next={false}
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
              onDragStart={(e: React.DragEvent) => e.preventDefault()}
              onClick={onClick ? handleClick : undefined}
              onMouseDown={mouseDownHandler}
              onWheel={handleWheel}
            />
          ) : (
            <img
              id={`photo-image__${photo.key}`}
              decoding="async"
              src={photo.src}
              style={createStyle()}
              onMouseUp={(e: React.MouseEvent) => {
                const { image: gestureImage, x: prevX, y: prevY } = gestureInfo;
                const moveX = e.clientX - prevX;
                const moveY = e.clientY - prevY;
                const isVertical = Math.abs(moveY) > Math.abs(moveX);
                const move = isVertical ? moveY : moveX;
                const isPositive = move > 0;
                const hash = gestureImage?.hash;
                if (hash && Math.abs(move) > 32) {
                  let rating: number | null = null;
                  if (isVertical) {
                    rating = isPositive ? 4 : 1;
                  } else {
                    rating = isPositive ? 3 : 2;
                  }
                  if (gestureImage?.rating === rating) {
                    rating = 0;
                  }
                  updateRating(hash, rating, false);
                }
                setGestureInfo({ x: -1, y: -1, image: null });
              }}
              onDragStart={(e: React.DragEvent) => e.preventDefault()}
              onClick={onClick ? handleClick : undefined}
              onWheel={handleWheel}
              onContextMenu={handleContextMenu}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onLoad={async e => {
                const imageElement = e.target as HTMLImageElement;
                if (image.width !== imageElement.naturalWidth) {
                  // may be rotated, fix it.
                  updateSize(
                    image.hash,
                    imageElement.naturalWidth,
                    imageElement.naturalHeight
                  );
                }
              }}
              onMouseDown={mouseDownHandler}
            />
          )}
        </Box>
      </Box>
    );
  },
  (p, n) => {
    // console.log(omitBy(n, (v, k) => (p as any)[k] === v));
    // ignore specific fields
    const skipFields = ["onClick", "photo", "currentIndex", "selectedImage"];
    if (!shallowEqual(omit(p, skipFields), omit(n, skipFields))) {
      return false;
    }
    const { range } = n;
    const isNeighbour =
      n.currentIndex - range - range < n.index &&
      n.index < n.currentIndex + range + range;
    // const isNeighbour = leftTopIndex < n.index && leftTopIndex + n.range * 2;
    if (isNeighbour) {
      return false;
    }
    if (p.image.rating !== n.image.rating) {
      return false;
    }
    if (
      Array.from(Array(5))
        .map((x, num: number) => num + 1)
        .some(num => {
          const key = `t${num}`;
          if ((p.image as any)[key] !== (n.image as any)[key]) {
            return true;
          }
          return false;
        })
    ) {
      return false;
    }
    if (p.currentIndex === p.index) {
      return false;
    }
    if (n.currentIndex === n.index) {
      return false;
    }
    return true;
  }
);
export default GridPhoto;
