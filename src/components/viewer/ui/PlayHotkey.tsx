import React from "react";
import Hotkeys from "react-hot-keys";

interface Props {
  togglePlay: Function;
}

const PlayHotkey: React.FunctionComponent<Props> = ({ togglePlay }) => {
  return (
    <Hotkeys
      allowRepeat={false}
      keyName="p"
      /*
      onKeyDown={(keyName: string, event: KeyboardEvent) => {
        event.preventDefault();
      }}
      */
      onKeyUp={() => {
        togglePlay();
      }}
    />
  );
};

export default PlayHotkey;
