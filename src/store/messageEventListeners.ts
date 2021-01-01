import { Store } from "unistore";
import { navigate } from "@reach/router";
import produce from "immer";
import copy from "copy-to-clipboard";
import { State } from "../types/unistore";
import { IFrameMessage } from "../types/window";
import IFrameUtil from "../utils/IFrameUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import UrlUtil from "../utils/dedupper/UrlUtil";

export default function(store: Store<State>) {
  window.addEventListener(
    "message",
    (event: any) => {
      const message: IFrameMessage = event.data;

      switch (message.type) {
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
        case "customEvent": {
          const e = new CustomEvent(message.payload.name, {
            detail: message.payload.detail
          });
          document.dispatchEvent(e);
          break;
        }
        case "superReload":
          [
            document.getElementById("grid-viewer-iframe"),
            document.getElementById("main-viewer-iframe"),
            SubViewerHelper.getWindow()?.document.getElementById(
              "main-viewer-iframe"
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
