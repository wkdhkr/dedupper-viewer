import { Box } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import React from "react";

type CurrentIconProps = {
  fontSize: "small" | "inherit" | "default" | "large" | undefined;
};

const CurrentIcon: React.FunctionComponent<CurrentIconProps> = React.memo(
  ({ fontSize }) => {
    return (
      <Box zIndex={1000} position="absolute" right="0px">
        <CheckCircle fontSize={fontSize} color="secondary" />
      </Box>
    );
  }
);

export default CurrentIcon;
