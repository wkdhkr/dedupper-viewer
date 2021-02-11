import { Store } from "unistore";
import { navigate } from "@reach/router";
import produce from "immer";
import * as log from "loglevel";
import copy from "copy-to-clipboard";
import { debounce, keyBy } from "lodash";
import { DedupperImage, State } from "../types/unistore";
import { IFrameMessage } from "../types/window";
import IFrameUtil from "../utils/IFrameUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import UrlUtil from "../utils/dedupper/UrlUtil";
import DomUtil from "../utils/DomUtil";
import WindowUtil from "../utils/WindowUtil";
import ThumbSliderUtil from "../utils/ThumbSliderUtil";
import PerformanceUtil from "../utils/PerformanceUtil";
import GridViewerUtil from "../utils/GridViewerUtil";
import ImageArrayUtil from "../utils/ImageArrayUtil";
import actions from "../actions";
import DedupperClient from "../services/dedupper/DedupperClient";

export default function(store: Store<State>) {
  const debouncedLoadTimeImages = debounce(actions(store).loadTimeImages, 500);
  window.addEventListener(
    "message",
    async (event: any) => {
      const state = store.getState();
      const message: IFrameMessage = event.data;

      if (((message as any).source || "").startsWith("react-devtools-")) {
        return;
      }

      if (!message?.type.startsWith("for")) {
        log.trace(message, window.location.href);
      }
      switch (message.type) {
        case "configuration":
          store.setState(
            produce(state, (draft) => {
              draft.configuration = {
                ...message.payload,
                open: draft.configuration.open,
              };
            })
          );
          break;
        case "gridScrollTo": {
          const hash = message.payload || state.gridViewer.selectedImage?.hash;
          if (hash) {
            GridViewerUtil.scrollToLeftTopHash(
              hash,
              state.mainViewer.images,
              state.configuration
            );
          }
          break;
        }
        case "showMainViewer":
          store.setState(
            produce(state, (draft) => {
              draft.gridViewer.showMainViewer = message.payload;
            })
          );
          if (message.payload === false && !IFrameUtil.isInIFrame()) {
            IFrameUtil.postMessageById(
              {
                type: "gridScrollTo",
                payload: null,
              },
              "grid-viewer-iframe",
              "*"
            );
          }
          break;
        case "toggleGridViewerPlay":
          if (UrlUtil.isInGridViewer() && IFrameUtil.isInIFrame()) {
            actions(store).toggleGridPlay(state);
          }
          break;
        case "toggleMainViewerPlay":
          if (UrlUtil.isInMainViewer() && IFrameUtil.isInIFrame()) {
            actions(store).togglePlay(state);
          }
          break;
        case "navigateImage":
          if (UrlUtil.isInGridViewer() && IFrameUtil.isInIFrame()) {
            const isPrev = message.payload;
            const { gridViewer } = state;
            actions(store).selectedByIndex(
              state,
              gridViewer.index + (isPrev ? -1 : 1)
            );
          }
          break;
        case "selectedRecommend": {
          break;
        }
        case "selected":
          if (UrlUtil.isInMainViewer() && IFrameUtil.isInIFrame()) {
            PerformanceUtil.decodeImage(message.payload.hash);
            const index = state.mainViewer.images
              .map((x) => x.hash)
              .indexOf(message.payload.hash);
            if (index !== -1) {
              DomUtil.getViewer().view(index);
            }
          } else if (UrlUtil.isInGridViewer() && IFrameUtil.isInIFrame()) {
            store.setState(
              produce(state, (draft) => {
                const image = draft.imageByHash[message.payload.hash];
                const { hash } = message.payload as {
                  hash: string;
                  index: number;
                };
                const index = ImageArrayUtil.findIndex(
                  hash,
                  draft.mainViewer.images
                );
                if (image) {
                  draft.gridViewer.selectedImage =
                    draft.imageByHash[hash] || null;
                  if (index) {
                    draft.gridViewer.index = index;
                  }
                }
              })
            );
          }
          /*
          GridViewerUtil.scrollToLeftTopHash(
            message.payload.hash,
            store.getState().mainViewer.images,
            store.getState().configuration
          );
          */
          break;
        case "loadImages":
          if (
            UrlUtil.isInMainViewer() &&
            UrlUtil.isInline() &&
            IFrameUtil.isInIFrame()
          ) {
            store.setState(
              produce(state, (draft) => {
                draft.mainViewer.images = message.payload;
                draft.imageByHash = keyBy<DedupperImage>(
                  message.payload,
                  "hash"
                );
                draft.mainViewer.index = 0;
              })
            );
          }
          if (UrlUtil.isInListThumbSlider() && IFrameUtil.isInIFrame()) {
            if (
              !UrlUtil.isInline() ||
              (UrlUtil.isInline() && !state.configuration.enableSubViewer)
            ) {
              store.setState(
                produce(state, (draft) => {
                  draft.mainViewer.images = message.payload;
                  draft.imageByHash = keyBy<DedupperImage>(
                    message.payload,
                    "hash"
                  );
                  draft.thumbSlider.index = 0;
                  draft.thumbSlider.selectedImage =
                    draft.mainViewer.images[0] || null;
                })
              );
            }
          }
          break;
        case "thumbSliderViewed": {
          if (IFrameUtil.isInIFrame()) {
            if (UrlUtil.isInMainViewer()) {
              PerformanceUtil.decodeImage(message.payload.hash);
            }
            if (UrlUtil.isInGridViewer() && !state.gridViewer.showMainViewer) {
              actions(store).selected(state, message.payload.hash);
            }
          }
          break;
        }
        case "viewed":
          if (
            UrlUtil.isInGridViewer() &&
            IFrameUtil.isInIFrame() &&
            state.gridViewer.showMainViewer
          ) {
            store.setState(
              produce(store.getState(), (draft) => {
                const image = draft.imageByHash[message.payload.hash];
                const { hash, index } = message.payload as {
                  hash: string;
                  index: number;
                };
                if (image) {
                  draft.gridViewer.selectedImage =
                    draft.imageByHash[hash] || null;
                  draft.gridViewer.index = index;
                }
              })
            );
          }
          if (UrlUtil.isInTimeThumbSlider() && IFrameUtil.isInIFrame()) {
            debouncedLoadTimeImages(store.getState(), message.payload);
          } else if (
            UrlUtil.isInPHashThumbSlider() &&
            IFrameUtil.isInIFrame()
          ) {
            const { p_Hash: pHash, hash } = message.payload;
            let pHashFixed = pHash;
            if (!pHash) {
              const dc = new DedupperClient();
              const result = await dc.query(
                `select p_hash from hash where hash = '${hash}'`,
                false
              );
              pHashFixed = result[0]?.p_hash;
            }
            if (pHashFixed) {
              actions(store).loadPHashImages(store.getState(), pHashFixed);
            }
          } else if (UrlUtil.isInListThumbSlider()) {
            store.setState(
              produce(store.getState(), (draft) => {
                const image = draft.imageByHash[message.payload.hash];
                const { hash, index } = message.payload as {
                  hash: string;
                  index: number;
                };
                if (image) {
                  draft.thumbSlider.selectedImage =
                    draft.imageByHash[hash] || null;
                  draft.thumbSlider.index = index;
                }
              })
            );
            setTimeout(() => {
              const leftTopHash = ThumbSliderUtil.getLeftTopHash(
                message.payload.hash,
                store.getState().mainViewer.images,
                store.getState().configuration
              );
              if (leftTopHash) {
                const el = document.getElementById(
                  `photo-container__${leftTopHash}`
                );
                WindowUtil.scrollToNative(el);
              }
            });
            IFrameUtil.postMessageForOther({
              type: "thumbSliderViewed",
              payload: {
                ...message.payload,
                nextLeftIndex: ThumbSliderUtil.getNextLeftTopHash(
                  message.payload.hash,
                  store.getState().mainViewer.images,
                  store.getState().configuration
                ),
              },
            });
          }
          break;
        case "subViewerReferencePrepared":
          SubViewerHelper.finishReferenceWaiting();
          break;
        case "prepareSubViewerReference":
          if (window.opener) {
            try {
              window.opener.subViewerWindow = window;
              IFrameUtil.postMessageForParent({
                type: "forAll",
                payload: {
                  type: "subViewerReferencePrepared",
                },
              });
            } catch (e) {
              // ignore cross domain error
            }
          }
          break;
        case "copy":
          // navigator.clipboard.writeText(message.payload.text);
          copy(message.payload.text);
          break;
        case "forSubViewer": {
          if (UrlUtil.isInGridViewer()) {
            const w = SubViewerHelper.getWindow();
            if (w) {
              IFrameUtil.postMessageById(
                message.payload,
                "main-viewer-iframe",
                "*",
                w
              );
            }
          }
          break;
        }
        case "forAllWithParent":
          window.postMessage(message.payload, "*");
        // eslint-disable-next-line no-fallthrough
        case "forAll": {
          ([
            "forGrid",
            "forMainViewer",
            "forSubViewer",
            "forThumbSlider",
          ] as const).forEach((type) => {
            const newMessage: IFrameMessage = {
              ...message,
              type,
            };
            const w = window.parent?.opener || window.parent || window;
            w.postMessage(newMessage, "*");
          });
          break;
        }
        case "forThumbSlider": {
          const w = SubViewerHelper.getWindow();
          if (w) {
            IFrameUtil.postMessageById(
              message.payload,
              "thumb-slider-iframe",
              "*",
              w
            );
          }
          IFrameUtil.postMessageById(
            message.payload,
            "thumb-slider-iframe",
            "*"
          );
          break;
        }
        case "forGrid": {
          if (UrlUtil.isInGridViewer()) {
            IFrameUtil.postMessageById(
              message.payload,
              "grid-viewer-iframe",
              "*"
            );
          }
          break;
        }
        case "forMainViewer": {
          IFrameUtil.postMessageById(
            message.payload,
            "main-viewer-iframe",
            "*"
          );
          const w = SubViewerHelper.getWindow();
          if (w) {
            IFrameUtil.postMessageById(
              message.payload,
              "main-viewer-iframe",
              "*",
              w
            );
          }

          break;
        }
        case "customEvent": {
          const e = new CustomEvent(message.payload.name, {
            detail: message.payload.detail,
          });
          document.dispatchEvent(e);
          break;
        }
        case "superReload":
          [
            document.getElementById("thumb-slider-iframe"),
            document.getElementById("grid-viewer-iframe"),
            document.getElementById("main-viewer-iframe"),
            SubViewerHelper.getWindow()?.document.getElementById(
              "main-viewer-iframe"
            ),
            SubViewerHelper.getWindow()?.document.getElementById(
              "thumb-slider-iframe"
            ),
          ]
            .map((el) => {
              if (el) {
                const iframeEl = (el as any) as HTMLIFrameElement;
                const p = iframeEl.parentElement;
                iframeEl.remove();
                return [p, iframeEl] as const;
              }
              return [null, null] as const;
            })
            .forEach(([p, el]) => {
              setTimeout(() => {
                if (p && el) {
                  const params = new URL(document.location.href).searchParams;
                  el.setAttribute(
                    "src",
                    el.src.replace(
                      /([?&])unit=[1-9]/,
                      `$1unit=${params.get("unit")}` || "1"
                    )
                  );
                  p.appendChild(el);
                }
              }, 1000);
            });

          break;
        case "mainSubViewer":
          store.setState(
            produce(store.getState(), (draft) => {
              draft.mainViewer.subViewer.isOpen = true;
              draft.mainViewer.subViewer.url = message.payload;
              draft.gridViewer.subViewer.isOpen = false;
            })
          );
          (document.getElementById(
            "grid-viewer-iframe"
          ) as any)?.contentWindow?.focus();
          break;
        case "subViewer":
          if (UrlUtil.isInGridViewer()) {
            store.setState(
              produce(state, (draft) => {
                draft.gridViewer.subViewer.isOpen = true;
                draft.mainViewer.subViewer.isOpen = false;
                draft.mainViewer.subViewer.url = null;
                draft.gridViewer.selectedImage = message.payload;
              })
            );
            (document.getElementById(
              "grid-viewer-iframe"
            ) as any)?.contentWindow?.focus();
          }
          break;
        case "navigateSubViewer":
          if (
            !UrlUtil.isInline() &&
            (UrlUtil.isInMainViewer() || UrlUtil.isInSingleViewer())
          ) {
            store.setState(
              produce(state, (draft) => {
                if (message.payload.image) {
                  draft.imageByHash[message.payload.image.hash] =
                    message.payload.image;
                }
              })
            );
            navigate(message.payload.path, { replace: true });
            if (IFrameUtil.isInIFrame()) {
              window.parent.postMessage(
                {
                  type: "navigateParent",
                  payload: message.payload.path,
                },
                "*"
              );
            }
          }
          break;
        case "navigate":
          navigate(message.payload);
          if (IFrameUtil.isInIFrame()) {
            window.parent.postMessage(
              {
                type: "navigateParent",
                payload: message.payload,
              },
              "*"
            );
          }
          break;
        case "navigateParent":
          window.history.replaceState(null, document.title, message.payload);
          break;
        case "navigateIF":
          IFrameUtil.postMessageById(
            {
              type: "navigate",
              payload: message.payload.path,
            },
            message.payload.id,
            message.payload.origin
          );
          // navigate(message.payload);
          break;

        default:
      }
    },
    false
  );
}
