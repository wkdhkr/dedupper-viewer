import { Box, Chip } from "@material-ui/core";
import { throttle } from "lodash";
import React, { useEffect, useState } from "react";
import { GestureInfo } from "../../../types/unistore";
import GestureUtil from "../../../utils/GestureUtil";
import MouseEventUtil from "../../../utils/MouseEventUtil";

type GestureTipProps = {
  disabled: boolean;
  gestureInfo: GestureInfo;
};

const GestureTip: React.FunctionComponent<GestureTipProps> = React.memo(
  ({ gestureInfo, disabled }) => {
    const [[gestureTip, x, y], setGestureTip] = useState<
      [string | null, number, number]
    >([null, 0, 0]);

    useEffect(() => {
      const onMouseout = (event: MouseEvent) => {
        if (
          event.clientY <= 0 ||
          event.clientX <= 0 ||
          event.clientX >= window.innerWidth ||
          event.clientY >= window.innerHeight
        ) {
          // setGestureInfo({ x: -1, y: -1, image: null });
          setGestureTip([null, 0, 0]);
        }
      };
      document.body.addEventListener("mouseleave", onMouseout);
      return () => document.body.removeEventListener("mouseleave", onMouseout);
    }, [disabled]);

    useEffect(() => {
      const onMouseMove = throttle((event: MouseEvent) => {
        if (gestureInfo.image) {
          const flags = GestureUtil.detectDiagonalFlags(event, gestureInfo);
          if (flags) {
            if (flags.isLeftBottomMove) {
              setGestureTip(["↙️", event.clientX, event.clientY]);
            } else if (flags.isLeftTopMove) {
              setGestureTip(["↖️", event.clientX, event.clientY]);
            } else if (flags.isRightBottomMove) {
              setGestureTip(["↘️", event.clientX, event.clientY]);
            } else if (flags.isRightTopMove) {
              setGestureTip(["↗️", event.clientX, event.clientY]);
            } else {
              setGestureTip([null, 0, 0]);
            }
          } else {
            const rating = GestureUtil.detectRating(event, gestureInfo);
            if (rating != null) {
              setGestureTip([
                `Rating: ${rating}`,
                event.clientX,
                event.clientY,
              ]);
            } else {
              setGestureTip([null, 0, 0]);
            }
          }
        } else {
          setGestureTip([null, 0, 0]);
        }
      }, 32);
      document.body.addEventListener("mousemove", onMouseMove);
      return () => {
        setGestureTip([null, 0, 0]);
        document.body.removeEventListener("mousemove", onMouseMove);
      };
    }, [gestureInfo, disabled]);

    const e = MouseEventUtil.getMoveEvent();

    if (!e || !gestureTip) {
      return <></>;
    }
    if (e.button !== 0) {
      return <></>;
    }

    if (disabled) {
      return <></>;
    }

    return (
      <Box
        zIndex={1355}
        position="fixed"
        top={(y || e.clientY) + 5}
        left={(x || e.clientX) + 5}
      >
        <Chip color="primary" label={gestureTip} />
      </Box>
    );
  }
);

export default GestureTip;
