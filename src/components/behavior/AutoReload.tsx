import React, { useEffect } from "react";

type AutoReloadProps = {
  isPlay: boolean;
  unit: number;
  range: number;
  imageCount: number;
  load: Function;
  index: number;
};

const AutoReload: React.FunctionComponent<AutoReloadProps> = ({
  isPlay,
  imageCount,
  range,
  load,
  index
}) => {
  useEffect(() => {
    const isLastPage = index + range === imageCount;

    // TODO: undocumented
    if (imageCount > 10 && isPlay && isLastPage) {
      setTimeout(() => load());
    }
  }, [isPlay, index, range, imageCount]);
  return <></>;
};

export default AutoReload;
