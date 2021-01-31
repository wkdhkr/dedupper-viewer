import { Store } from "unistore";
import { navigate } from "@reach/router";
import produce from "immer";
import copy from "copy-to-clipboard";
import { keyBy } from "lodash";
import { DedupperImage, State } from "../types/unistore";
import { IFrameMessage } from "../types/window";
import IFrameUtil from "../utils/IFrameUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import UrlUtil from "../utils/dedupper/UrlUtil";
import DomUtil from "../utils/DomUtil";
import WindowUtil from "../utils/WindowUtil";
import ThumbSliderUtil from "../utils/ThumbSliderUtil";
import PerformanceUtil from "../utils/PerformanceUtil";

export default function(store: Store<State>) {
  window.addEventListener(
    "message",
    (event: any) => {
      const message: IFrameMessage = event.data;

      console.log(message, window.location.href);

      switch (message.type) {
        case "toggleMainViewerPlay":
          if (UrlUtil.isInMainViewer() && IFrameUtil.isInIFrame()) {
            store.setState(
              produce(store.getState(), draft => {
                draft.mainViewer.isPlay = !draft.mainViewer.isPlay;
              })
            );
          }
          break;
        case "selected":
          if (UrlUtil.isInMainViewer() && IFrameUtil.isInIFrame()) {
            const state = store.getState();
            const index = state.mainViewer.images
              .map(x => x.hash)
              .indexOf(message.payload.hash);
            if (index !== -1) {
              DomUtil.getViewer().view(index);
            }
          }
          break;
        case "loadImages":
          if (UrlUtil.isInThumbSlider() && IFrameUtil.isInIFrame()) {
            store.setState(
              produce(store.getState(), draft => {
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
          break;
        case "thumbSliderViewed": {
          const hash = store.getState().mainViewer.images[
            message.payload.nextLeftIndex
          ]?.hash;
          PerformanceUtil.decodeImage(hash);
          break;
        }
        case "viewed":
          if (UrlUtil.isInThumbSlider()) {
            store.setState(
              produce(store.getState(), draft => {
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
                )
              }
            });
          }
          break;
        case "prepareSubViewerReference":
          if (window.opener) {
            try {
              window.opener.subViewerWindow = window;
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
        case "forAll": {
          ([
            "forGrid",
            "forMainViewer",
            "forSubViewer",
            "forThumbSlider"
          ] as const).forEach(type => {
            const newMessage: IFrameMessage = {
              ...message,
              type
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
          if (UrlUtil.isInMainViewer()) {
            IFrameUtil.postMessageById(
              message.payload,
              "main-viewer-iframe",
              "*"
            );
          } else {
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
        case "customEvent": {
          const e = new CustomEvent(message.payload.name, {
            detail: message.payload.detail
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
            )
          ]
            .map(el => {
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
            produce(store.getState(), draft => {
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
              produce(store.getState(), draft => {
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
          store.setState(
            produce(store.getState(), draft => {
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
                payload: message.payload.path
              },
              "*"
            );
          }
          break;
        case "navigate":
          navigate(message.payload);
          if (IFrameUtil.isInIFrame()) {
            window.parent.postMessage(
              {
                type: "navigateParent",
                payload: message.payload
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
              payload: message.payload.path
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
