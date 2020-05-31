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
      onKeyUp={(keyName: string, event: KeyboardEvent) => {
        togglePlay();
      }}
    />
  );
};

export default PlayHotkey;
