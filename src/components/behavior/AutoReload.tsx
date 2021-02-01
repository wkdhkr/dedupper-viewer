import React, { useEffect } from "react";

type AutoReloadProps = {
  disabled: boolean;
  isPlay: boolean;
  unit: number;
  range: number;
  imageCount: number;
  load: Function;
  index: number;
};

const AutoReload: React.FunctionComponent<AutoReloadProps> = ({
  disabled,
  isPlay,
  imageCount,
  range,
  load,
  index,
}) => {
  useEffect(() => {
    if (!disabled && range > 0) {
      const isLastPage = index + range === imageCount;

      // TODO: undocumented
      if (imageCount > 10 && isPlay && isLastPage) {
        setTimeout(() => load());
      }
    }
  }, [isPlay, index, range, imageCount, disabled, load]);
  return <></>;
};

export default AutoReload;
