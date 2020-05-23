/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import { navigate, RouteComponentProps } from "@reach/router";
import clsx from "clsx";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import HomeIcon from "@material-ui/icons/Home";
import MenuIcon from "@material-ui/icons/Menu";

import {
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RssFeed, Fullscreen } from "@material-ui/icons";
import { APP_NAME } from "../constants/dedupperConstants";

const useStyles = makeStyles(theme => ({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  },
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

type HomeProps = RouteComponentProps;

const Home: React.FunctionComponent<HomeProps> = ({ children }) => {
  const classes = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {APP_NAME}
          </Typography>
          {/* <Button color="inherit">Login</Button> */}
          <IconButton
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
            }}
            color="inherit"
          >
            <Fullscreen />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div
          className={clsx(classes.list)}
          role="presentation"
          onClick={() => setIsDrawerOpen(false)}
        >
          <List>
            <ListItem button onClick={() => navigate("/")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={() => navigate("/channels/")}>
              <ListItemIcon>
                <RssFeed />
              </ListItemIcon>
              <ListItemText primary="Channels" />
            </ListItem>
          </List>
        </div>
      </Drawer>
      {children}
    </>
  );
};

export default Home;
