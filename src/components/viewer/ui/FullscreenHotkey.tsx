import React from "react";
import Hotkeys from "react-hot-keys";
import IFrameUtil from "../../../utils/IFrameUtil";

interface Props {
  keyName?: string;
}

const FullscreenHotkey: React.FunctionComponent<Props> = ({
  keyName = "m",
}) => {
  return (
    <Hotkeys
      allowRepeat={false}
      keyName={keyName}
      /*
      onKeyDown={(keyName: string, event: KeyboardEvent) => {
        event.preventDefault();
      }}
      */
      onKeyUp={() => {
        IFrameUtil.postMessageForParent({
          type: "toggleFullscreen",
          payload: null,
        });
      }}
    />
  );
};

export default FullscreenHotkey;
