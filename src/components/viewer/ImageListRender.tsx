import React, { PureComponent } from "react";
import Viewer from "viewerjs";

import "viewerjs/dist/viewer.min.css";
import { initImageExpand } from "../../patch/viewer";
import { DedupperImage } from "../../types/unistore";
import UrlUtil from "../../utils/dedupper/UrlUtil";

interface ImageListRenderProps {
  isPlay: boolean;
  togglePlay: Function;
  load: () => Promise<void>;
  unload: () => void;
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

  componentDidMount() {
    const { load } = this.props;
    load();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidUpdate(prevProps: ImageListRenderProps) {
    const {
      images,
      index,
      hide,
      togglePlay,
      options: customOptions
    } = this.props;

    if (this.viewer) {
      return;
    }
    if (images.length === 0) {
      return;
    }

    const {
      toolbar: customToolbar,
      hidden,
      ...restOptions
    } = customOptions || { toolbar: {} };
    const toolbarOptions = {
      show: true,
      size: "large" as Viewer.ToolbarButtonSize
    };
    const options = {
      title: false,
      zoomRatio: 0.1,
      zIndex: 1350, // under 1500, upper 1300, Snackbar  and modal z-index
      transition: false,
      fullscreen: false,
      // transition: true,
      button: false,
      backdrop: "static",
      toolbar: {
        zoomIn: toolbarOptions,
        zoomOut: toolbarOptions,
        oneToOne: toolbarOptions,
        reset: toolbarOptions,
        prev: toolbarOptions,
        play: {
          ...toolbarOptions,
          click: () => {
            togglePlay();
          }
        },
        next: toolbarOptions,
        rotateLeft: toolbarOptions,
        rotateRight: toolbarOptions,
        flipHorizontal: toolbarOptions,
        flipVertical: toolbarOptions,
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
    if (this.containerDiv.current && images.length) {
      const viewer = new Viewer(this.containerDiv.current, options);
      (viewer as any).initImage = initImageExpand;
      viewer.view(index);
      this.viewer = viewer;
      const params = new URLSearchParams(window.location.search);
      if (params.get("play")) {
        togglePlay();
      }
    }
  }

  componentWillUnmount() {
    const { viewer } = this as any;
    if (viewer) {
      (viewer as any).ready = true;
      if (!viewer.viewer) {
        [(viewer as any).viewer] = document.getElementsByClassName(
          "viewer-container"
        );
      }
      viewer.destroy();
      this.viewer = null;
      const { isPlay, togglePlay, unload } = this.props;
      if (isPlay && togglePlay) {
        togglePlay();
      }
      unload();
    }
  }
}
export default ImageListRender;
