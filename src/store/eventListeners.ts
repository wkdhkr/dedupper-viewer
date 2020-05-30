/* eslint-disable func-names */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
import { Store } from "unistore";
import debounce from "lodash/debounce";
// import Viewer from "viewerjs";
import isEqual from "lodash/isEqual";
import { State } from "../types/unistore";
import DomUtil from "../utils/DomUtil";
import actions from "../actions";

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
  document.body.addEventListener<any>("viewed", function(
    event: CustomEvent<any>
  ) {
    try {
      actions(store).viewed(
        store.getState(),
        DomUtil.getCurrentHash(event),
        event.detail.index
      );
      // console.log("viewed", event);
      if (DomUtil.getViewer().index === 0) {
        actions(store).showSnackbarCustom(store.getState(), [
          "This is first image.",
          {
            variant: "info",
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: "right", vertical: "top" }
          }
        ]);
      }
    } catch (e) {
      // ignore
    }
  });
  document.body.addEventListener<any>("ready", function() {
    actions(store).showSnackbarCustom(store.getState(), [
      "Viewer.js is ready.",
      {
        variant: "info",
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: "right", vertical: "top" }
      }
    ]);
    // console.log("ready", event);
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
      const hash = DomUtil.getCurrentHash();
      const viewer = DomUtil.getViewer();
      if (hash && viewer) {
        const trim = JSON.stringify(viewer.imageData);
        actions(store).updateTrim(store.getState(), hash, trim);
      } else {
        console.log("hash not found.");
      }
    }, 2000)
  );

  let pointerX = -1;
  let pointerY = -1;

  addListener(document, EVENT_POINTER_DOWN, function(event: PointerEvent) {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  addListener(document, EVENT_POINTER_UP, function(event: PointerEvent) {
    let hash;
    let viewer;
    try {
      hash = DomUtil.getCurrentHash();
      viewer = DomUtil.getViewer();
    } catch (e) {
      return;
    }
    if (hash && viewer) {
      if (event.composedPath().indexOf(DomUtil.getViewerCanvas()) !== -1) {
        if (pointerX !== event.clientX || pointerY !== event.clientY) {
          if (!isEqual(viewer.imageData, viewer.initialImageData)) {
            const trim = JSON.stringify(viewer.imageData);
            actions(store).updateTrim(store.getState(), hash, trim);
          }
        }
      }
      if (
        event
          .composedPath()
          .indexOf(document.getElementsByClassName("viewer-reset")[0]) !== -1
      ) {
        // reset button clicked
        actions(store).updateTrim(store.getState(), hash, "");
      }
    } else {
      console.log("hash not found.");
    }
  });

  window.addEventListener("load", () => {
    // actions(store).loadMainViewerImages(store.getState());
    actions(store).loadChannels(store.getState());
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
}
