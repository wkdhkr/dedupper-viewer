import { LinearProgress } from "@material-ui/core";
import React from "react";

type AjaxProgressProps = {
  connectionCount: number;
};

const AjaxProgress: React.FunctionComponent<AjaxProgressProps> = ({
  connectionCount,
}: AjaxProgressProps) => {
  if (connectionCount < 1) {
    return <></>;
  }
  return (
    <LinearProgress
      variant="determinate"
      value={Math.max(100 - connectionCount * 2, 0)}
      style={{
        width: "100%",
        zIndex: 1000,
        position: "fixed",
        top: window.innerHeight - 4,
        left: 0,
      }}
    />
  );
};

export default AjaxProgress;
