import React, { useEffect } from "react";
import NewWindow from "react-new-window";
import { DedupperImage, SubViewerState } from "../../types/unistore";
import UrlUtil from "../../utils/dedupper/UrlUtil";
import SubViewerHelper from "../../helpers/viewer/SubViewerHelper";
import ViewerUtil from "../../utils/ViewerUtil";

interface SubViewerProps extends SubViewerState {
  image: DedupperImage | null;
  toggle: Function;
}

(window as any).subViewerWindow = null as Window | null;

const SubViewer: React.FunctionComponent<SubViewerProps> = ({
  isOpen,
  toggle,
  image
}) => {
  /*
  useEffect(() => {
    if (image) {
      const w = SubViewerHelper.getWindow();
      if (w) {
        if ((w as any).navigate) {
          (w as any).navigate(UrlUtil.generateImageViewerUrl(image.hash), {
            replace: true
          });
        }
      }
    }
  }, [image]);
  */

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

  return (
    <NewWindow
      copyStyles={false}
      onOpen={w => SubViewerHelper.setWindow(w)}
      features={{
        width,
        height,
        location: "no",
        toolbar: "no",
        dependent: "yes"
      }}
      onUnload={() => {
        if (isOpen) {
          toggle();
        }
        SubViewerHelper.setWindow(null);
      }}
      name="dedupper_sub_viewer"
      url={UrlUtil.generateImageViewerUrl(image ? image.hash : "")}
    />
  );
};

export default SubViewer;
