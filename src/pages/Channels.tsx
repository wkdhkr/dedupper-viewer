/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { RouteComponentProps } from "@reach/router";
import {
  Button,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Grid,
  Box
} from "@material-ui/core";
import { Dictionary } from "lodash";
import { DedupperChannel } from "../types/unistore";
import ConfirmDialog from "../components/feedback/ConfirmDialog";
import UnitMenu from "../components/channels/UnitMenu";
import { useQueryString } from "../hooks/queryString";
import SlideUp from "../transitions/SlideUp";
import ChannelTable from "../components/channels/ChannelTable";
import RouterUtil from "../utils/RouterUtil";
// import SubViewerHelper from "../helpers/viewer/SubViewerHelper";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
    /*
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch"
    }
    */
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  appBar: {
    position: "relative"
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  }
}));

type ChannelsProps = {
  enableSubViewer: boolean;
  channelById: Dictionary<DedupperChannel>;
  changeUnit: (x: number) => void;
  handleCreate: (c: DedupperChannel) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleUpdate: (c: DedupperChannel) => Promise<void>;
  channels: DedupperChannel[];
} & RouteComponentProps;

const Channels: React.FunctionComponent<ChannelsProps> = ({
  enableSubViewer,
  channels,
  channelById,
  changeUnit,
  handleCreate,
  handleUpdate,
  handleDelete
}) => {
  const classes = useStyles();
  // const [isShowDialog, setIsShowDialog] = useState(false);
  const [edit, setEdit] = useQueryString("edit");
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);
  const [rowInfo, setRowInfo] = React.useState<null | {
    anchorEl: HTMLElement;
    orientation: "portrait" | "landscape";
    url: string;
  }>(null);

  /*
  useEffect(() => {
    if (edit && edit !== "new" && !channelById[edit]) {
      setEdit("new");
    }
  }, [edit]);
  */
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [sql, setSql] = useState("");
  const [channelName, setChannelName] = useState("");

  const handleClose = () => {
    setSql("");
    setChannelName("");
    setCurrentChannelId(null);
    // setIsShowDialog(false);
    setEdit(null);
  };
  return (
    <>
      <UnitMenu
        onClose={() => setRowInfo(null)}
        orientation={rowInfo?.orientation || "portrait"}
        onClick={(e, n) => {
          if (rowInfo) {
            RouterUtil.navigateForIFWrap(`${rowInfo.url}&unit=${n}`);
            changeUnit(n);
            /*
            setTimeout(
              () =>
                SubViewerHelper.spawnParentWindow(`${rowInfo.url}&unit=${n}`),
              500
            );
            */
          }
        }}
        anchorEl={rowInfo?.anchorEl}
      />
      <ConfirmDialog
        open={isShowDeleteDialog}
        title="Delete Channel"
        text="Are you sure you want to delete this channel?
The channel will be permanently removed."
        handleClose={() => setIsShowDeleteDialog(false)}
        handleOk={() => {
          if (currentChannelId) {
            handleDelete(currentChannelId);
          }
          handleClose();
          setIsShowDeleteDialog(false);
        }}
      />
      <Dialog
        onBackdropClick={handleClose}
        // maxWidth="xl"
        // fullWidth
        fullScreen
        open={Boolean(edit)}
        TransitionComponent={SlideUp as any}
      >
        <AppBar color="secondary" className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {channelById[edit || ""] ? "Edit channel" : "Create new channel"}
            </Typography>
            <Button
              autoFocus
              color="inherit"
              onClick={() => {
                if (edit && edit !== "new" && channelById[edit]) {
                  handleUpdate({
                    id: edit,
                    name: channelName,
                    sql
                  });
                } else {
                  handleCreate({
                    id: "",
                    name: channelName,
                    sql
                  });
                }
                handleClose();
              }}
            >
              save
            </Button>
          </Toolbar>
        </AppBar>
        <div className={classes.root}>
          <Grid container>
            <Grid item xs={12}>
              <form className={classes.root} noValidate autoComplete="off">
                <Grid item xs={12}>
                  <Box padding={2}>
                    <TextField
                      autoFocus
                      label="Channel Name"
                      onChange={event => setChannelName(event.target.value)}
                      fullWidth
                      value={channelName}
                    />
                  </Box>
                  <Box padding={2}>
                    <TextField
                      label="SQL"
                      multiline
                      onChange={event => setSql(event.target.value)}
                      fullWidth
                      inputProps={{
                        style: {
                          fontSize: 25,
                          lineHeight: "120%",
                          fontFamily: "Monospace"
                        }
                      }}
                      value={sql}
                    />
                  </Box>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </div>
      </Dialog>
      <ChannelTable
        enableSubViewer={enableSubViewer}
        channelById={channelById}
        channels={channels}
        setEdit={setEdit}
        setRowInfo={setRowInfo}
        setSql={setSql}
        setIsShowDeleteDialog={setIsShowDeleteDialog}
        setChannelName={setChannelName}
        handleCreate={handleCreate}
        setCurrentChannelId={setCurrentChannelId}
      />
    </>
  );
};

export default Channels;
