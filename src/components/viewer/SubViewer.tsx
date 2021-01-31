import React, { useEffect } from "react";
import NewWindow from "react-new-window";
import { DedupperImage } from "../../types/unistore";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import SubViewerHelper from "../../helpers/viewer/SubViewerHelper";
import ViewerUtil from "../../utils/ViewerUtil";
import IFrameUtil from "../../utils/IFrameUtil";
import { IFrameMessage } from "../../types/window";

interface SubViewerProps {
  url: string | null;
  isGridOpen: boolean;
  isMainOpen: boolean;
  origin: string;
  image: DedupperImage | null;
  toggle: (close: boolean | null) => void;
}

const SubViewer: React.FunctionComponent<SubViewerProps> = React.memo(
  ({ origin, url, isGridOpen, isMainOpen, toggle, image }) => {
    useEffect(() => {
      const w = SubViewerHelper.getWindow();
      if (url && w) {
        const params = `mode=subviewer&parentHost=${window.location.hostname}`;
        const path = url.includes("?") ? url + params : `${url}?${params}`;
        const message: IFrameMessage = {
          type: "navigateSubViewer",
          payload: {
            path,
            image
          }
        };
        IFrameUtil.postMessageById(message, "main-viewer-iframe", origin, w);
      } else if (image && w) {
        const message: IFrameMessage = {
          type: "navigateSubViewer",
          payload: {
            path: `${UrlUtil.generateImageViewerUrl(
              image.hash
            )}?mode=subviewer&parentHost=${window.location.hostname}`,
            image
          }
        };
        IFrameUtil.postMessageById(message, "main-viewer-iframe", origin, w);
      }
    }, [image, url]);

    if (!isGridOpen && !isMainOpen) {
      return <></>;
    }

    let width = window.screen.width / 2;
    let height = window.screen.height / 2;
    const isPortraitImage = ViewerUtil.isPortraitImage();
    if (
      (isPortraitImage && width > height) ||
      (!isPortraitImage && height > width)
    ) {
      const tmp = height;
      height = width;
      width = tmp;
    }

    const u = new URL(window.location.origin);
    u.hostname = UrlUtil.extractParam("parentHost") || u.hostname;
    let subViewerUrl = "";
    if (isMainOpen && url) {
      subViewerUrl = `${u.origin}${url}`;
      const forMainUrl = new URL(subViewerUrl);
      forMainUrl.searchParams.set("mode", "subviewer");
      forMainUrl.searchParams.set("parentHost", window.location.hostname);
      subViewerUrl = forMainUrl.toString();
    } else if (isGridOpen) {
      subViewerUrl = `${u.origin}${UrlUtil.generateImageViewerUrl(
        image ? image.hash : ""
      )}?mode=subviewer&parentHost=${window.location.hostname}`;
    }

    return (
      <NewWindow
        copyStyles={false}
        onOpen={w => {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          // (w as any).__DEDUPPER_VIEWER_SUB_VIEWER__ = true;
          SubViewerHelper.setWindow(w);
        }}
        features={{
          width,
          height,
          location: "no",
          toolbar: "no"
          // dependent: "yes"
        }}
        // center="screen"
        onUnload={() => {
          toggle(false);
          SubViewerHelper.setWindow(null);
        }}
        name="dedupper_sub_viewer"
        url={subViewerUrl}
      />
    );
  }
);

export default SubViewer;
