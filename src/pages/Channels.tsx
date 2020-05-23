/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, Ref, useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import MaterialTable, { Icons } from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { RouteComponentProps, navigate } from "@reach/router";
import {
  Button,
  Container,
  Dialog,
  SvgIcon,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Grid,
  Box
} from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import PlayArrow from "@material-ui/icons/PlayArrow";
import SkipNext from "@material-ui/icons/SkipNext";

import AddBox from "@material-ui/icons/AddBox";
// import ArrowUpward from "@material-ui/icons/ArrowUpward";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { Delete, FileCopy } from "@material-ui/icons";
import { Dictionary } from "lodash";
import { DedupperChannel } from "../types/unistore";
import ConfirmDialog from "../components/feedback/ConfirmDialog";

const iconComponentByTableIconType: Record<keyof Icons, typeof SvgIcon> = {
  Add: AddBox,
  Check,
  Clear,
  Delete: DeleteOutline,
  DetailPanel: ChevronRight,
  Edit,
  Export: SaveAlt,
  Filter: FilterList,
  FirstPage,
  LastPage,
  NextPage: ChevronRight,
  PreviousPage: ChevronLeft,
  ResetSearch: Clear,
  Search,
  SortArrow: ArrowDownward,
  ThirdStateCheck: Remove,
  ViewColumn
};

const tableIcons = Object.entries(iconComponentByTableIconType).reduce(
  (currentTableIcons: Icons, [tableIconType, IconComponent]) => {
    // eslint-disable-next-line no-param-reassign
    currentTableIcons[
      tableIconType as keyof Icons
    ] = forwardRef((props, ref: Ref<SVGSVGElement>) => (
      <IconComponent {...props} ref={ref} />
    ));
    return currentTableIcons;
  },
  {}
);
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

const Transition: any = React.forwardRef(function Transition(props: any, ref) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />;
});

type ChannelsProps = {
  channelById: Dictionary<DedupperChannel>;
  handleCreate: (c: DedupperChannel) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleUpdate: (c: DedupperChannel) => Promise<void>;
  channels: DedupperChannel[];
} & RouteComponentProps;

const Channels: React.FunctionComponent<ChannelsProps> = ({
  channels,
  channelById,
  handleCreate,
  handleUpdate,
  handleDelete
}) => {
  const classes = useStyles();
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [sql, setSql] = useState("");
  const [channelName, setChannelName] = useState("");

  const handleClose = () => {
    setSql("");
    setChannelName("");
    setCurrentChannelId(null);
    setIsShowDialog(false);
  };
  return (
    <>
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
      <Dialog fullScreen open={isShowDialog} TransitionComponent={Transition}>
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
              {currentChannelId ? "Edit channel" : "Create new channel"}
            </Typography>
            <Button
              autoFocus
              color="inherit"
              onClick={() => {
                if (currentChannelId) {
                  handleUpdate({
                    id: currentChannelId,
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
      <Container maxWidth="lg">
        <h2>Channels</h2>
        <MaterialTable
          icons={tableIcons}
          columns={[
            {
              title: "Channel Name",
              field: "name"
            }
          ]}
          data={channels
            .map(c => ({ ...c }))
            .sort((a, b) => (a.name > b.name ? 1 : -1))}
          options={{
            // grouping: true,
            actionsColumnIndex: -1,
            showTitle: false,
            headerStyle: { fontWeight: "bold" },
            paging: false
          }}
          onRowClick={(event, rowData: any) =>
            navigate(`/channel/${rowData.id}`)
          }
          actions={[
            {
              icon: () => <AddBox />,
              tooltip: "Add Channel",
              isFreeAction: true,
              onClick: () => setIsShowDialog(true)
            },
            {
              icon: () => <PlayArrow />,
              tooltip: "play",
              onClick: (event, rowData: any) => {
                navigate(`/channel/${rowData.id}?play=1`);
              }
            },
            {
              icon: () => <SkipNext />,
              tooltip: "show",
              onClick: (event, rowData) => {
                navigate(`/channel/${rowData.id}`);
              }
            },
            {
              icon: () => <Edit />,
              tooltip: "edit",
              onClick: (event, rowData: any) => {
                const { id } = rowData as DedupperChannel;
                setCurrentChannelId(id);
                setChannelName(channelById[id].name);
                setSql(channelById[id].sql);
                setIsShowDialog(true);
              }
            },
            {
              icon: () => <FileCopy />,
              tooltip: "copy",
              onClick: (event, rowData: any) => {
                const r = rowData as DedupperChannel;
                handleCreate({
                  id: "",
                  name: `${r.name} (copy)`,
                  sql: r.sql
                });
              }
            },
            {
              icon: () => <Delete />,
              tooltip: "delete",
              onClick: (event, rowData: any) => {
                setCurrentChannelId((rowData as DedupperChannel).id);
                setIsShowDeleteDialog(true);
              }
            }
          ]}
        />
      </Container>
    </>
  );
};

export default Channels;
