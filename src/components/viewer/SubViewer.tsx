import React, { useEffect } from "react";
import NewWindow from "react-new-window";
import { DedupperImage, SubViewerState } from "../../types/unistore";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import SubViewerHelper from "../../helpers/viewer/SubViewerHelper";
import ViewerUtil from "../../utils/ViewerUtil";
import IFrameUtil from "../../utils/IFrameUtil";
import { IFrameMessage } from "../../types/window";

interface SubViewerProps extends SubViewerState {
  origin: string;
  image: DedupperImage | null;
  toggle: (close: boolean | null) => void;
}

const SubViewer: React.FunctionComponent<SubViewerProps> = React.memo(
  ({ origin, isOpen, toggle, image }) => {
    useEffect(() => {
      if (image) {
        /*
      const w = SubViewerHelper.getWindow();
      if (w) {
        if ((w as any).navigate) {
          (w as any).navigate(UrlUtil.generateImageViewerUrl(image.hash), {
            replace: true
          });
        }
      }
      */
        const w = SubViewerHelper.getWindow();
        if (w) {
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
      }
    }, [image]);

    if (!isOpen) {
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
    const url = `${u.origin}${UrlUtil.generateImageViewerUrl(
      image ? image.hash : ""
    )}?mode=subviewer&parentHost=${window.location.hostname}`;

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
        url={url}
      />
    );
  }
);

export default SubViewer;
