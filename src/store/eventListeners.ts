/* eslint-disable func-names */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
import { Store } from "unistore";
import produce from "immer";
import * as log from "loglevel";
import debounce from "lodash/debounce";
// import Viewer from "viewerjs";
import isEqual from "lodash/isEqual";
import { State } from "../types/unistore";
import DomUtil from "../utils/DomUtil";
import actions from "../actions";
import UrlUtil from "../utils/dedupper/UrlUtil";
import { EVENT_X_KEY } from "../constants/dedupperConstants";
import IFrameUtil from "../utils/IFrameUtil";
import { ImageData, MainViewer } from "../types/viewer";
import ColorUtil from "../utils/ColorUtil";
import WindowUtil from "../utils/WindowUtil";
import PerformanceUtil from "../utils/PerformanceUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import { IFrameMessageType } from "../types/window";
import TrimUtil from "../utils/dedupper/TrimUtil";
import WorkerUtil from "../utils/WorkerUtil";
import MouseEventUtil from "../utils/MouseEventUtil";
import GestureUtil from "../utils/GestureUtil";

const REGEXP_SPACES = /\s\s*/; // Misc
const IS_BROWSER =
  typeof window !== "undefined" && typeof window.document !== "undefined";
const WINDOW = IS_BROWSER ? window : {};
const IS_TOUCH_DEVICE = IS_BROWSER
  ? "ontouchstart" in window.document.documentElement
  : false;
const HAS_POINTER_EVENT = IS_BROWSER ? "PointerEvent" in WINDOW : false;
const EVENT_TOUCH_END = IS_TOUCH_DEVICE ? "touchend touchcancel" : "mouseup";

const EVENT_TOUCH_START = IS_TOUCH_DEVICE ? "touchstart" : "mousedown";
const EVENT_POINTER_DOWN = HAS_POINTER_EVENT
  ? "pointerdown"
  : EVENT_TOUCH_START;
const EVENT_POINTER_UP = HAS_POINTER_EVENT
  ? "pointerup pointercancel"
  : EVENT_TOUCH_END;
/**
 * Add event listener to the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Function} listener - The event listener.
 * @param {Object} options - The event options.
 */
function addListener(element: any, type: any, listener: any) {
  const options =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  let _handler = listener;
  type
    .trim()
    .split(REGEXP_SPACES)
    .forEach(function(event: any) {
      if (options.once /* && !onceSupported */) {
        const _element$listeners = element.listeners;
        const listeners =
          // eslint-disable-next-line no-void
          _element$listeners === void 0 ? {} : _element$listeners;

        _handler = function handler() {
          delete listeners[event][listener];
          element.removeEventListener(event, _handler, options);

          let _len2;
          let args;
          let _key2;
          for (
            // eslint-disable-next-line vars-on-top
            _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
            _key2 < _len2;
            // eslint-disable-next-line no-plusplus
            _key2++
          ) {
            args[_key2] = arguments[_key2];
          }

          listener.apply(element, args);
        };

        if (!listeners[event]) {
          listeners[event] = {};
        }

        if (listeners[event][listener]) {
          element.removeEventListener(
            event,
            listeners[event][listener],
            options
          );
        }

        listeners[event][listener] = _handler;
        // eslint-disable-next-line no-param-reassign
        element.listeners = listeners;
      }

      element.addEventListener(event, _handler, options);
    });
}

export default function(store: Store<State>) {
  const debouncedShowSnackbarCustom = debounce(
    actions(store).showSnackbarCustom,
    500
  );
  const isInClassNameEvent = (event: MouseEvent, name: string) =>
    event.composedPath().indexOf(document.getElementsByClassName(name)[0]) !==
    -1;
  const update = (
    hash: string,
    viewer: MainViewer,
    fixedImageData: ImageData
  ) => {
    const trim = JSON.stringify(fixedImageData);
    actions(store).updateTrim(store.getState(), hash, trim);
    // eslint-disable-next-line no-param-reassign
    viewer.imageData = fixedImageData;
    viewer.zoomTo(fixedImageData.ratio);
  };

  const updateColor = (hash: string, value: number) => {
    let fixedValue = value;
    if (value > 360) {
      fixedValue -= 360;
    }
    if (value < 0) {
      fixedValue += 360;
    }
    actions(store).updateColor(store.getState(), hash, "hue", fixedValue);
  };

  let mouseDownFlag = false;

  document.body.addEventListener(
    "contextmenu",
    function(event) {
      let viewer: MainViewer | null = null;
      let hash: string | null = null;
      try {
        hash = DomUtil.getCurrentHash();
        viewer = DomUtil.getViewer();
      } catch (e) {
        return;
      }
      const currentHue = viewer.imageData.hue || 0;
      if (isInClassNameEvent(event, "viewer-zoom-in")) {
        event.preventDefault();
        updateColor(hash, currentHue + 10);
      } else if (isInClassNameEvent(event, "viewer-zoom-out")) {
        event.preventDefault();
        updateColor(hash, currentHue - 10);
      } else if (isInClassNameEvent(event, "viewer-flip-horizontal")) {
        event.preventDefault();
        setTimeout(() => {
          if (viewer && hash) {
            const left = TrimUtil.calcFitLeftPosition(viewer.imageData);
            const fixedImageData = { ...viewer.imageData };
            fixedImageData.x = left;
            fixedImageData.left = left;
            update(hash, viewer, fixedImageData);
          }
        });
      } else if (isInClassNameEvent(event, "viewer-flip-vertical")) {
        event.preventDefault();
        setTimeout(() => {
          if (viewer && hash) {
            const top = TrimUtil.calcFitTopPosition(viewer.imageData);
            const fixedImageData = { ...viewer.imageData };
            fixedImageData.y = top;
            fixedImageData.top = top;
            update(hash, viewer, fixedImageData);
          }
        });
      } else if (isInClassNameEvent(event, "viewer-rotate-right")) {
        event.preventDefault();
        actions(store).toggleTrimRotation(store.getState(), "right");
      } else if (isInClassNameEvent(event, "viewer-rotate-left")) {
        event.preventDefault();
        actions(store).toggleTrimRotation(store.getState(), "left");
      }
    },
    false
  );
  document.body.addEventListener<any>("viewed", function(
    event: CustomEvent<any>
  ) {
    try {
      const prevState = store.getState();
      actions(store).viewed(
        prevState,
        DomUtil.getCurrentHash(event),
        event.detail.index
      );
      // console.log("viewed", event);
      const { mainViewer, configuration } = store.getState();
      const { flipRandomInPlay } = configuration;
      const vc = DomUtil.getViewerCanvas();
      if (flipRandomInPlay && mainViewer.isPlay) {
        if (Math.random() * 100 < flipRandomInPlay) {
          vc.style.transform = "scaleX(-1)";
        } else {
          vc.style.transform = "none";
        }
      } else {
        vc.style.transform = "none";
      }
      const viewer = DomUtil.getViewer();
      const filter = ColorUtil.createFilter(viewer.imageData);
      if (filter && viewer.image) {
        viewer.image.style.filter = filter;
      }
      if (!UrlUtil.isInSingleViewer()) {
        if (DomUtil.getViewer().index === 0) {
          if (
            !store.getState().gridViewer.showMainViewer &&
            UrlUtil.isInline()
          ) {
            // ignore
          } else {
            debouncedShowSnackbarCustom(store.getState(), [
              "This is first image.",
              {
                variant: "info",
                autoHideDuration: 3000,
                anchorOrigin: { horizontal: "right", vertical: "top" },
              },
            ]);
          }
        }
        // preload, for performance
        PerformanceUtil.decodeImage(
          mainViewer.images[event.detail.index + 1]?.hash
        );
        PerformanceUtil.decodeImage(
          (
            mainViewer.images[event.detail.index - 1] ||
            mainViewer.images.slice(-1).pop()
          )?.hash
        ); // prev
      }
    } catch (e) {
      // ignore
    }
  });
  document.body.addEventListener<any>("ready", function() {
    if (!UrlUtil.isInSingleViewer()) {
      actions(store).showSnackbarCustom(store.getState(), [
        "Viewer.js is ready.",
        {
          variant: "info",
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: "right", vertical: "top" },
        },
      ]);
      // console.log("ready", event);
    }
    const vc = DomUtil.getViewerCanvas();
    vc.oncontextmenu = (e: MouseEvent) => {
      e.preventDefault();
      const hash = DomUtil.getCurrentHash();
      const state = store.getState();
      const image = state.imageByHash[hash];
      if (image) {
        const value = image.t1 ? null : 1;
        const next = state.configuration.selectNextAfterEditInMainViewer;
        actions(store).updateTag(state, hash, value, "t1", next);
      }
    };
  });
  document.body.addEventListener<any>("show", function() {
    // console.log("show", event);
  });
  document.body.addEventListener<any>("hide", function() {
    // console.log("hide", event);
  });
  document.body.addEventListener<any>("hidden", function() {
    // console.log("hidden", event);
  });
  document.body.addEventListener<any>("view", function() {
    // console.log("view", event);
  });
  /*
  document.body.addEventListener<any>("zoom", function(event: CustomEvent) {
    console.log("zoom", event);
  });
  */
  document.body.addEventListener<any>(
    "zoomed",
    debounce(function() {
      try {
        const hash = DomUtil.getCurrentHash();
        const viewer = DomUtil.getViewer();
        if (hash && viewer) {
          const trim = JSON.stringify(viewer.imageData);
          actions(store).updateTrim(store.getState(), hash, trim);
        } else {
          log.error("hash not found.", hash);
        }
      } catch (e) {
        // ignored
      }
    }, 500)
  );

  let pointerX = -1;
  let pointerY = -1;

  // let pointerStartDate = new Date();
  // let pointerEndDate = new Date();

  const dispatchEventX = (type: IFrameMessageType) => {
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

  const handleMiddleClickForMain = () => {
    if (UrlUtil.isInSubViewer() && UrlUtil.isInSingleViewer()) {
      SubViewerHelper.prepareReference().then(() => dispatchEventX("forGrid"));
    } else if (UrlUtil.isInMainViewer()) {
      SubViewerHelper.prepareReference().then(() =>
        dispatchEventX("forThumbSlider")
      );
    } else {
      try {
        const hash = DomUtil.getCurrentHash();
        const next = store.getState().configuration
          .selectNextAfterEditInMainViewer;
        actions(store).updateTag(store.getState(), hash, 1, "t1", next);
      } catch (e) {
        // ignore
      }
    }
  };

  addListener(document, EVENT_POINTER_DOWN, function(event: PointerEvent) {
    // pointerStartDate = new Date();
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (UrlUtil.isInSingleViewer() || UrlUtil.isInMainViewer()) {
      if (event.button === 1) {
        event.preventDefault();
        handleMiddleClickForMain();
      } else if (event.button === 0) {
        if (isInClassNameEvent(event, "viewer-canvas")) {
          mouseDownFlag = true;

          MouseEventUtil.resetMoved();
          setTimeout(() => {
            if (!MouseEventUtil.isMoved() && mouseDownFlag) {
              DomUtil.setViewerMovable(true);
              DomUtil.getViewer().pointerdown(event);
              actions(store).setGestureInfo(store.getState(), {
                image: null,
                x: 0,
                y: 0,
              });
            }
          }, 1000);
          const state = store.getState();
          actions(store).setGestureInfo(state, {
            image: state.mainViewer.currentImage,
            x: event.clientX,
            y: event.clientY,
          });
        }
      }
    }
  });

  addListener(document, EVENT_POINTER_UP, function(event: PointerEvent) {
    mouseDownFlag = false;
    // pointerEndDate = new Date();
    let viewer: MainViewer | null = null;
    let hash: string | null = null;
    try {
      hash = DomUtil.getCurrentHash();
      viewer = DomUtil.getViewer();
    } catch (e) {
      return;
    }
    if (hash && viewer) {
      const state = store.getState();

      setTimeout(() => {
        actions(store).setGestureInfo(state, {
          image: null,
          x: 0,
          y: 0,
        });
      });
      if (event.composedPath().indexOf(DomUtil.getViewerCanvas()) !== -1) {
        if (event.button === 1 && IFrameUtil.isInIFrame()) {
          IFrameUtil.postMessageForParent({
            type: "customEvent",
            payload: {
              name: EVENT_X_KEY,
            },
          });
        } else if (pointerX !== event.clientX || pointerY !== event.clientY) {
          const isMovable = viewer.options.movable;
          DomUtil.setViewerMovable(false);
          if (
            isMovable &&
            !isEqual(viewer.imageData, viewer.initialImageData)
          ) {
            const trim = JSON.stringify(viewer.imageData);
            actions(store).updateTrim(state, hash, trim);
          } else if (event.button === 0 || event.button === -1) {
            /*
            // TODO: drag lock mode
            let rating = store.getState().mainViewer.currentImage?.rating || 0;
            rating += 1;
            if (rating > 5) {
              rating = 0;
            }
            actions(store).updateRating(store.getState(), hash, rating, false);
            */
            const { gestureInfo } = state.mainViewer;
            const flags = GestureUtil.detectDiagonalFlags(event, gestureInfo);
            if (flags) {
              if (flags.isLeftBottomMove) {
                setTimeout(() => handleMiddleClickForMain());
              } else if (flags.isLeftTopMove) {
                //
              } else if (flags.isRightBottomMove) {
                //
              } else if (flags.isRightTopMove) {
                setTimeout(() => handleMiddleClickForMain());
              }
            } else {
              const rating = GestureUtil.detectRating(event, gestureInfo);
              if (gestureInfo.image && rating !== null) {
                actions(store).updateRating(
                  state,
                  gestureInfo.image.hash,
                  rating,
                  state.configuration.selectNextAfterEditInMainViewer
                );
              }
            }
          }
        }
      }
      if (
        event
          .composedPath()
          .indexOf(document.getElementsByClassName("viewer-reset")[0]) !== -1
      ) {
        // reset button clicked
        actions(store).updateTrim(state, hash, "");
        if (viewer.image) {
          viewer.image.style.filter = "";
        }
      }
      [
        "viewer-rotate-left",
        "viewer-rotate-right",
        "viewer-flip-horizontal",
        "viewer-flip-vertical",
      ].forEach((name) => {
        if (
          event
            .composedPath()
            .indexOf(document.getElementsByClassName(name)[0]) !== -1
        ) {
          setTimeout(() => {
            if (viewer && hash) {
              const trim = JSON.stringify(viewer.imageData);
              actions(store).updateTrim(store.getState(), hash, trim);
            }
          });
        }
      });
    } else {
      log.error("hash not found.", hash);
    }
  });

  window.addEventListener("load", () => {
    // actions(store).loadMainViewerImages(store.getState());
    actions(store).loadChannels(store.getState());
  });

  // auto hide mouse cursor
  let timer: NodeJS.Timeout;
  window.addEventListener("mousemove", () => {
    document.body.classList.remove("hideCursor");
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (UrlUtil.isPlay()) {
        document.body.classList.add("hideCursor");
      }
    }, 5000);
  });

  /*
  const changeScale = {
    container: 1080,
    percent: 1,
    function() {
      if (changeScale.percent === window.devicePixelRatio) {
        let scale = document.documentElement.clientWidth;
        scale /= changeScale.container;
        const t = `scale(${scale})`;
        document.body.style.transform = t;
      } else {
        changeScale.percent = window.devicePixelRatio;
      }
    }
  };
  (function() {
    changeScale.function();
  })();
  window.addEventListener("resize", event => {
    changeScale.function();
  });
  */
  window.addEventListener("beforunload", () => {
    WorkerUtil.terminate();
  });

  if (IFrameUtil.isInIFrame()) {
    /*
    window.addEventListener("resize", () => {
      GridViewerUtil.flushLeftTopHashCache();
    });
    */
    window.addEventListener(
      "resize",
      debounce(() => {
        /*
        const { configuration: c } = store.getState();
        const [fixedWidth, fixedHeight] = ViewerUtil.calcMainViewerSize(
          c.standardWidth,
          c.standardHeight
        );
        const container = document.getElementById("viewerContainer");
        if (container) {
          container.style.width = `${fixedWidth}px`;
          container.style.height = `${fixedHeight}px`;
        }
        // changeScale.function();
        */
        store.setState(
          produce(store.getState(), (draft) => {
            draft.mainViewer.images = draft.mainViewer.images.map((i) => ({
              ...i,
            }));
          })
        );
        if (UrlUtil.isInThumbSlider()) {
          const hash = store.getState().thumbSlider.selectedImage?.hash;
          if (hash) {
            const el = document.getElementById(`photo-container__${hash}`);
            WindowUtil.scrollToNative(el);
          }
        }
      }, 200)
    );
  } else {
    /*
    window.addEventListener("popstate", (e) => {
      if (!UrlUtil.isInSubViewer() || !e.state) {
        return;
      }
      const orientation = UrlUtil.extractOrientation();
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
    });
    */
  }
}
