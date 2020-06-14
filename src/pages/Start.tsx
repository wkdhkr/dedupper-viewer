import React from "react";
import { RouteComponentProps } from "@reach/router";
import {
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  Grid
} from "@material-ui/core";

type StartProps = RouteComponentProps;

const Start: React.FunctionComponent<StartProps> = () => {
  const url = new URL("chrome://settings/content/siteDetails");
  url.searchParams.set("site", window.location.origin);
  return (
    <Box m={2}>
      <h2>This is the Dedupper Viewer start page.</h2>
      <h3>Initial setup</h3>
      <Typography>
        Please allow the following in the settings of this site.
        <br />
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        "Clipboard", "Popup", "Unsafe Contents".
        <br />
        Do the same for the Inline frame origin described below.
      </Typography>
      <h3>How to use</h3>
      <Typography>
        Move the mouse cursor to the bottom of the window and the navigation bar
        will appear.
      </Typography>
      <Typography>
        In the configuration, set the origin of the inline frame. This is the
        domain for displaying images, which must be in another domain to control
        the image cache.
      </Typography>
      <Typography>
        On the Channels page, create some sql to query the dedupper database.
        SQL requires the result to have a hash column.
        <br />
        <br />
        Enjoy!
      </Typography>
    </Box>
  );
};

export default Start;
