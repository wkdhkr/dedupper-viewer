// eslint-disable-next-line max-classes-per-file
import React, { PureComponent, cloneElement } from "react";
import { deepMap } from "react-children-utilities";
import Viewer from "viewerjs";
import ImageListRender from "./ImageListRender";
import "./index.css";
import { DedupperImage } from "../../types/unistore";

const RViewerTriggerName = Symbol("RViewerTriggerName");
class RViewerTrigger extends PureComponent<{ index?: number }> {
  static componentName: symbol = RViewerTriggerName;

  render() {
    const children = this.props;
    return <div>{children}</div>;
  }
}

const isRViewerTrigger = (el: any): el is RViewerTrigger => {
  if (el) {
    if (
      typeof el === "string" ||
      typeof el === "number" ||
      typeof el === "boolean"
    ) {
      return false;
    }
    if (el.type.componentName) {
      return el.type.componentName === RViewerTriggerName;
    }
  }

  return false;
};
interface RViewerProps {
  isPlay: boolean;
  togglePlay: Function;
  options: Viewer.Options;
  load: () => Promise<void>;
  unload: () => void;
  images: DedupperImage[];
}

interface RViewerState {
  isShow: boolean;
  index: number;
}

class RViewer extends PureComponent<RViewerProps, RViewerState> {
  constructor(props: RViewerProps) {
    super(props);

    this.state = {
      isShow: true,
      index: 0
    };
  }

  show = (index = 0) => {
    this.setState({
      isShow: true,
      index
    });
  };

  hide = () => {
    this.setState({
      isShow: false
    });
  };

  render() {
    const {
      children,
      isPlay,
      unload,
      load,
      images,
      togglePlay,
      options
    } = this.props;
    const { isShow, index } = this.state;
    const { Fragment } = React;
    return (
      <Fragment>
        {isShow ? (
          <ImageListRender
            togglePlay={togglePlay}
            load={load}
            unload={unload}
            images={images}
            index={index}
            isPlay={isPlay}
            options={options}
            hide={this.hide}
          />
        ) : (
          <div />
        )}
        {deepMap(children, child => {
          if (child === null) {
            return <div />;
          }
          if (isRViewerTrigger(child)) {
            const props = {
              onClick: () => {
                this.show(child.props.index);
              }
            };

            return cloneElement(child.props.children as any, props);
          }
          return child;
        })}
      </Fragment>
    );
  }
}

interface MultiImageViewerProps {
  isPlay: boolean;
  togglePlay: Function;
  images: DedupperImage[];
  load: () => Promise<void>;
  unload: () => void;
}
const MultiImageViewer: React.SFC<MultiImageViewerProps> = ({
  load,
  unload,
  images,
  isPlay,
  togglePlay
}) => (
  <RViewer
    togglePlay={togglePlay}
    isPlay={isPlay}
    load={load}
    unload={unload}
    images={images}
    options={{}}
  >
    {/*
    <RViewerTrigger>
      <button type="button">Multiple images preview</button>
    </RViewerTrigger>
    */}
  </RViewer>
);

export { RViewerTrigger, RViewer, MultiImageViewer };
