import React, { forwardRef, Ref, useState } from "react";
import MaterialTable, { Icons } from "material-table";
import { Box, Container, Grid, SvgIcon } from "@material-ui/core";
import {
  AddBox,
  Slideshow,
  PhotoLibrary,
  SkipNext,
  FileCopy,
  Delete,
  ViewColumn,
  Remove,
  Check,
  Clear,
  SaveAlt,
  Edit,
  ChevronRight,
  DeleteOutline,
  FilterList,
  FirstPage,
  LastPage,
  ChevronLeft,
  Search,
  ArrowDownward,
  PlayArrow,
  Replay,
} from "@material-ui/icons";
import { Dictionary } from "lodash";
import { DedupperChannel } from "../../types/unistore";
// import SubViewerHelper from "../../helpers/viewer/SubViewerHelper";
import RouterUtil from "../../utils/RouterUtil";
import { IFrameMessage } from "../../types/window";
import FilterRadioButtons, { ChannelFilter } from "./FilterRadioButtons";
import ViewerUtil from "../../utils/ViewerUtil";

const getOrientationByName = (name: string) => {
  return name.toLowerCase().includes("portrait") ? "portrait" : "landscape";
};

const launchSubViewer = (url: string) => {
  const message: IFrameMessage = {
    type: "mainSubViewer",
    payload: url,
  };
  window.postMessage(message, "*");
};

const iconComponentByTableIconType: Record<keyof Icons, typeof SvgIcon> = {
  Retry: Replay,
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
  ViewColumn,
};

const tableIcons = Object.entries(iconComponentByTableIconType).reduce(
  (currentTableIcons: Icons, [tableIconType, IconComponent]) => {
    // eslint-disable-next-line no-param-reassign
    currentTableIcons[tableIconType as keyof Icons] = forwardRef(
      (props, ref: Ref<SVGSVGElement>) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <IconComponent {...props} ref={ref} />
      )
    );
    return currentTableIcons;
  },
  {}
);
type ChannelTableProps = {
  enableSubViewer: boolean;
  channels: DedupperChannel[];
  channelById: Dictionary<DedupperChannel>;
  handleCreate: (c: DedupperChannel) => Promise<void>;
  setChannelName: (x: string) => void;
  setSql: (x: string) => void;
  setIsShowDeleteDialog: (x: boolean) => void;
  setEdit: (x: string | null) => void;
  setRowInfo: (
    rowInfo: {
      anchorEl: HTMLElement;
      orientation: "portrait" | "landscape";
      url: string;
    } | null
  ) => void;
  setCurrentChannelId: (x: string | null) => void;
};

const launchViewer = (url: string, enableSubViewer = false) => {
  if (enableSubViewer) {
    launchSubViewer(url);
  } else {
    RouterUtil.navigateForIFWrap(url);
  }
};

const ChannelTable: React.FunctionComponent<ChannelTableProps> = React.memo(
  ({
    enableSubViewer,
    channelById,
    setRowInfo,
    handleCreate,
    setChannelName,
    setCurrentChannelId,
    setIsShowDeleteDialog,
    setSql,
    setEdit,
    channels,
  }) => {
    const [filter, setFilter] = useState<ChannelFilter>(
      ViewerUtil.isPortrait() ? "portrait" : "landscape"
    );
    return (
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <h2>Channels</h2>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="right" m={2}>
              <FilterRadioButtons
                onChange={(v) => setFilter(v)}
                value={filter}
              />
            </Box>
          </Grid>
        </Grid>
        <MaterialTable
          icons={tableIcons}
          columns={[
            {
              title: "Channel Name",
              field: "name",
            },
          ]}
          data={
            channels
              .filter((c) => {
                const isLandscape = c.name.includes("Landscape");
                const isPortrait = c.name.includes("Portrait");
                if (filter === "landscape") {
                  return isLandscape;
                }
                if (filter === "portrait") {
                  return isPortrait;
                }
                return true;
              })
              .map((c) => ({ ...c }))
              .sort((a, b) => (a.name > b.name ? 1 : -1)) as DedupperChannel[]
          }
          options={{
            // grouping: true,
            actionsColumnIndex: -1,
            showTitle: false,
            headerStyle: { fontWeight: "bold" },
            paging: false,
          }}
          onRowClick={(event, rowData) => {
            if (rowData) {
              RouterUtil.navigateForIFWrap(`/channel/${rowData.id}`);
              // SubViewerHelper.spawnParentWindow(`/channel/${rowData.id}`)
            }
          }}
          actions={[
            {
              icon: () => <AddBox />,
              tooltip: "Add Channel",
              isFreeAction: true,
              onClick: () => setEdit("new"),
            },
            {
              icon: () => <Slideshow />,
              tooltip: "grid play",
              onClick: (event, rowData) => {
                (Array.isArray(rowData) ? rowData : [rowData]).forEach((r) => {
                  const o = getOrientationByName(r.name);
                  setRowInfo({
                    anchorEl: event.currentTarget,
                    orientation: o,
                    url: `/channel/grid/${r.id}?play=1&o=${o}`,
                  });
                });
              },
            },
            {
              icon: () => <PhotoLibrary />,
              tooltip: "grid show",
              onClick: (event, rowData) => {
                (Array.isArray(rowData) ? rowData : [rowData]).forEach((r) => {
                  const o = getOrientationByName(r.name);
                  setRowInfo({
                    anchorEl: event.currentTarget,
                    orientation: o,
                    url: `/channel/grid/${r.id}?o=${o}`,
                  });
                });
              },
            },
            {
              icon: () => <PlayArrow />,
              tooltip: "play",
              onClick: (event, rowData) =>
                (Array.isArray(rowData) ? rowData : [rowData]).forEach((r) => {
                  const o = getOrientationByName(r.name);
                  const url = `/channel/${r.id}?play=1&o=${o}`;
                  launchViewer(url, enableSubViewer);
                }),
            },
            {
              icon: () => <SkipNext />,
              tooltip: "show",
              onClick: (event, rowData) =>
                (Array.isArray(rowData) ? rowData : [rowData]).forEach((r) => {
                  const o = getOrientationByName(r.name);
                  const url = `/channel/${r.id}?o=${o}`;
                  launchViewer(url, enableSubViewer);
                }),
            },
            {
              icon: () => <Edit />,
              tooltip: "edit",
              onClick: (event, rowData) => {
                (Array.isArray(rowData) ? rowData : [rowData]).forEach((r) => {
                  const { id } = r;
                  setCurrentChannelId(id);
                  setChannelName(channelById[id].name);
                  setSql(channelById[id].sql);
                  setEdit(id);
                });
              },
            },
            {
              icon: () => <FileCopy />,
              tooltip: "copy",
              onClick: (event, rowData) => {
                const rows = Array.isArray(rowData) ? rowData : [rowData];
                rows.forEach((r) =>
                  handleCreate({
                    id: "",
                    name: `${r.name} (copy)`,
                    sql: r.sql,
                  })
                );
              },
            },
            {
              icon: () => <Delete />,
              tooltip: "delete",
              onClick: (event, rowData) => {
                const rows = Array.isArray(rowData) ? rowData : [rowData];
                rows.forEach((r) => {
                  setCurrentChannelId(r.id);
                  setIsShowDeleteDialog(true);
                });
              },
            },
          ]}
        />
      </Container>
    );
  }
);

export default ChannelTable;
