import React, { ReactElement, useState, useEffect } from "react";
import IFrame from "react-iframe";
import { Box } from "@material-ui/core";
import IFrameUtil from "../utils/IFrameUtil";

const getHeight = () =>
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

function useCurrentWitdhHeight() {
  // save current window width in the state object
  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());

  // in this case useEffect will execute only once because
  // it does not have any dependencies.
  useEffect(() => {
    // timeoutId for debounce mechanism
    let timeoutId: NodeJS.Timeout | undefined;
    const resizeListener = () => {
      // prevent execution of previous setTimeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // change width from the state object after 150 milliseconds
      timeoutId = setTimeout(() => {
        setWidth(getWidth());
        setHeight(getHeight());
      }, 150);
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  return [width, height];
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IFrameWrapperProps {
  id: string;
  origin: string;
  url?: string;
  children: ReactElement;
}

const IFrameWrapper: React.FunctionComponent<IFrameWrapperProps> = React.memo(
  ({ id, url, children, origin }) => {
    const [w, h] = useCurrentWitdhHeight();
    if (IFrameUtil.isInIFrame()) {
      return children;
    }
    const iframeUrl = new URL(url || window.location.href);
    iframeUrl.hostname = new URL(origin).hostname; // TODO: configuration
    return (
      <Box position="absolute" top={0} left={0} width={w} height={h}>
        <IFrame
          id={id}
          // width={`${window.innerWidth}px`}
          width="100%"
          frameBorder={0}
          height="100%"
          onLoad={() => {
            const el = document.getElementById(id);
            if (el) {
              ((el as any) as HTMLIFrameElement).contentWindow?.focus();
            }
          }}
          url={iframeUrl.toString()}
        />
      </Box>
    );
  },
  () => {
    if (IFrameUtil.isInIFrame()) {
      return false;
    }
    return true;
  }
);

export default IFrameWrapper;
