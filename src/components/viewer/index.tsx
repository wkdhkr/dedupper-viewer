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
  channelId: string | null;
  colorReset: number;
  setColorReset: (x: number) => void;
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
      colorReset,
      setColorReset,
      images,
      togglePlay,
      channelId,
      options
    } = this.props;
    const { isShow, index } = this.state;
    const { Fragment } = React;
    return (
      <Fragment>
        {isShow ? (
          <ImageListRender
            channelId={channelId}
            colorReset={colorReset}
            setColorReset={setColorReset}
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

type MultiImageViewerProps = RViewerProps;
const MultiImageViewer: React.FunctionComponent<MultiImageViewerProps> = ({
  colorReset,
  setColorReset,
  load,
  unload,
  images,
  isPlay,
  options,
  channelId,
  togglePlay
}) => (
  <RViewer
    channelId={channelId}
    colorReset={colorReset}
    setColorReset={setColorReset}
    togglePlay={togglePlay}
    isPlay={isPlay}
    load={load}
    unload={unload}
    images={images}
    options={options}
  >
    {/*
    <RViewerTrigger>
      <button type="button">Multiple images preview</button>
    </RViewerTrigger>
    */}
  </RViewer>
);

export { RViewerTrigger, RViewer, MultiImageViewer };
