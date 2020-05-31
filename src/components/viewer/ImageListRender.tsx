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

    const {
      toolbar: customToolbar,
      hidden,
      ...restOptions
    } = customOptions || { toolbar: {} };
    const toolbarOptions = {
      show: true,
      size: "large" as Viewer.ToolbarButtonSize
    };

    const hasMultiImage = images.length > 1;

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
        prev: hasMultiImage ? toolbarOptions : false,
        play: hasMultiImage
          ? {
              ...toolbarOptions,
              click: () => {
                togglePlay();
              }
            }
          : false,
        next: hasMultiImage ? toolbarOptions : false,
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
    if (this.viewer) {
      if (prevProps.images.length === 1 && images.length === 1) {
        if (prevProps.images[0].hash !== images[0].hash) {
          this.destroyViewer();
          this.initViewer(options);
        }
      }
      return;
    }
    if (images.length === 0) {
      return;
    }
    if (this.containerDiv.current && images.length) {
      this.initViewer(options);
      const params = new URLSearchParams(window.location.search);
      if (params.get("play")) {
        togglePlay();
      }
    }
  }

  initViewer = (options: Viewer.Options) => {
    Viewer.noConflict();
    const viewer = new Viewer(
      document.getElementById("viewer-source-container") as any,
      options
    );
    (viewer as any).initImage = initImageExpand;
    viewer.view(0);
    this.viewer = viewer;
  };

  destroyViewer = () => {
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
    }
  };

  componentWillUnmount() {
    this.destroyViewer();
    const { isPlay, togglePlay, unload } = this.props;
    if (isPlay && togglePlay) {
      togglePlay();
    }
    unload();
  }
}
export default ImageListRender;
