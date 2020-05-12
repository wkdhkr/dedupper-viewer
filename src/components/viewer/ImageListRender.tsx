import React, { PureComponent } from "react";
import Viewer from "viewerjs";

import "viewerjs/dist/viewer.min.css";
import { initImageExpand } from "../../patch/viewer";
import { DedupperImage } from "../../types/unistore";
import UrlUtil from "../../utils/dedupper/UrlUtil";

interface ImageListRenderProps {
  images: DedupperImage[];
  index: number;
  hide: Function;
  options: Viewer.Options;
}

class ImageListRender extends PureComponent<ImageListRenderProps> {
  viewer: Viewer | null = null;

  containerDiv: React.RefObject<HTMLUListElement>;

  constructor(props: ImageListRenderProps) {
    super(props);
    this.containerDiv = React.createRef();
  }

  render() {
    const { images } = this.props;
    return (
      <ul
        id="viewer-source-container"
        style={{ display: "none" }}
        ref={this.containerDiv}
      >
        {images.map(({ hash }) => (
          <li key={hash}>
            <img
              data-hash={hash}
              loading="lazy"
              decoding="async"
              src={UrlUtil.generateImageUrl(hash)}
            />
          </li>
        ))}
      </ul>
    );
  }

  componentDidUpdate() {
    const { index, hide, options: customOptions } = this.props;
    const {
      toolbar: customToolbar,
      hidden,
      ...restOptions
    } = customOptions || { toolbar: {} };
    const options = {
      zIndex: 1250, // under 1500, Snackbar z-index
      // transition: false,
      fullscreen: false,
      transition: true,
      button: false,
      backdrop: "static",
      toolbar: {
        zoomIn: true,
        zoomOut: true,
        oneToOne: true,
        reset: true,
        prev: true,
        // play: true,
        next: true,
        rotateLeft: true,
        rotateRight: 4,
        flipHorizontal: true,
        flipVertical: true,
        ...(typeof customToolbar === "object" ? customToolbar : {})
      },
      // navbar: true,
      navbar: false,
      ...restOptions,
      hidden: () => {
        if (hidden) {
          hidden(new CustomEvent("viewer-hidden"));
        }
        hide();
      }
    };
    if (this.containerDiv.current) {
      const viewer = new Viewer(this.containerDiv.current, options);
      (viewer as any).initImage = initImageExpand;
      viewer.view(index);
      this.viewer = viewer;
    }
  }

  componentWillUnmount() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }
}
export default ImageListRender;
