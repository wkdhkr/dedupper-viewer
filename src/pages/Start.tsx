import React from "react";
import { RouteComponentProps } from "@reach/router";
import { Box, Typography } from "@material-ui/core";

type StartProps = RouteComponentProps;

const Start: React.FunctionComponent<StartProps> = () => {
  return (
    <Box m={2} textAlign="center">
      <Typography variant="h3">
        This is the Dedupper Viewer start page.
      </Typography>
      <Typography>
        Move the mouse cursor to the bottom of the window and the navigation bar
        will appear.
      </Typography>
    </Box>
  );
};

export default Start;
