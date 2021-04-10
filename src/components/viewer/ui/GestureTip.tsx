import { Box, Chip } from "@material-ui/core";
import { throttle } from "lodash";
import React, { useEffect, useState } from "react";
import { shallowEqual } from "shallow-equal-object";
import { GestureInfo } from "../../../types/unistore";
import GestureUtil from "../../../utils/GestureUtil";
import MouseEventUtil from "../../../utils/MouseEventUtil";

type GestureTipProps = {
  disabled: boolean;
  gestureInfo: GestureInfo;
};

const GestureTip: React.FunctionComponent<GestureTipProps> = React.memo(
  ({ gestureInfo, disabled }) => {
    const [gestureTipWithXy, setGestureTip] = useState<
      [string | null, number, number]
    >([null, 0, 0]);
    const [gestureTip, x, y] = gestureTipWithXy;

    useEffect(() => {
      const onMouseup = () => {
        setGestureTip([null, 0, 0]);
      };
      document.body.addEventListener("mouseup", onMouseup);
      return () => document.body.removeEventListener("mouseup", onMouseup);
    }, []);

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
      const onMouseMove = throttle((event: PointerEvent) => {
        if (gestureInfo.image) {
          const flags = GestureUtil.detectDiagonalFlags(event, gestureInfo);
          if (flags) {
            if (flags.isLeftBottomMove) {
              setGestureTip([
                "↙️ apply delete tag",
                event.clientX,
                event.clientY,
              ]);
            } else if (flags.isLeftTopMove) {
              setGestureTip(["↖ color:️ down", event.clientX, event.clientY]);
            } else if (flags.isRightBottomMove) {
              setGestureTip(["↘️ color: up", event.clientX, event.clientY]);
            } else if (flags.isRightTopMove) {
              setGestureTip([
                "↗ apply delete tag",
                event.clientX,
                event.clientY,
              ]);
            } else {
              setGestureTip(gestureTipWithXy);
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
              setGestureTip(gestureTipWithXy);
            }
          }
        } else {
          setGestureTip(gestureTipWithXy);
        }
      }, 16);
      document.body.addEventListener("pointermove", onMouseMove);
      return () => {
        setGestureTip([null, 0, 0]);
        document.body.removeEventListener("pointermove", onMouseMove);
      };
    }, [gestureInfo, disabled]);

    const e = MouseEventUtil.getPointerMoveEvent();

    if (!e || !gestureTip) {
      return <></>;
    }

    if (e.button !== 0 && e.button !== -1) {
      return <></>;
    }

    if (disabled) {
      return <></>;
    }

    /*
    if (e.clientX === x && e.clientY === y) {
      return <></>;
    }
    */

    return (
      <Box
        zIndex={1355}
        position="fixed"
        top={e.clientY + 5}
        left={e.clientX + 5}
      >
        <Chip color="primary" label={gestureTip} />
      </Box>
    );
  },
  (p, n) => {
    if (!shallowEqual(p.gestureInfo, n.gestureInfo)) {
      return false;
    }
    if (p.disabled !== n.disabled) {
      return false;
    }

    return true;
  }
);

export default GestureTip;
