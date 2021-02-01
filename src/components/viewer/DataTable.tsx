import React from "react";
import copy from "copy-to-clipboard";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, IconButton, Box } from "@material-ui/core";
import {
  Assignment,
  GetApp,
  AssignmentReturned,
  CameraAlt,
  Cloud,
} from "@material-ui/icons";
import Table from "@material-ui/core/Table";
import orderBy from "lodash/orderBy";
import filesize from "filesize.js";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
// import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import axios from "axios";
import Paper from "@material-ui/core/Paper";
import { DedupperImage, ConfigurationState } from "../../types/unistore";
import UrlUtil from "../../utils/dedupper/UrlUtil";

const useStyles = makeStyles({
  noMaxWidth: {
    maxWidth: "none",
  },
  table: {
    maxWidth: 640,
  },
});

interface DataTableProps {
  index: number;
  imageCount: number;
  configuration: ConfigurationState;
  image: DedupperImage | null;
}

const DataTable: React.FunctionComponent<DataTableProps> = ({
  image,
  index,
  imageCount,
  configuration: c,
}) => {
  const classes = useStyles();
  if (image === null) {
    return <></>;
  }

  const rows = [
    /*
    {
      name: "hash",
      value: image.hash
    },
    */
    // { name: "path", value: image.to_path },
    {
      name: "index",
      value: `${index + 1}/${imageCount}`,
      skip: index === imageCount - 1,
    },
    { name: "date", value: new Date(image.timestamp).toLocaleDateString() },
    { name: "size", value: filesize(image.size) },
    { name: "resolution", value: `${image.width}x${image.height}` },
    {
      name: "extension",
      value:
        image.to_path
          .split(".")
          .pop()
          ?.toLowerCase() || "N/A",
    },
    ...orderBy(
      [
        { name: "neutral", value: image.neutral },
        { name: "porn", value: image.porn },
        { name: "hentai", value: image.hentai },
        { name: "sexy", value: image.sexy },
        { name: "drawing", value: image.drawing },
      ],
      ["value"],
      ["desc"]
    ),
    { name: "porn_sexy", value: image.porn_sexy },
    { name: "hentai_porn", value: image.hentai_porn },
    { name: "hentai_porn_sexy", value: image.hentai_porn_sexy },
  ].filter((r) => !(r as any).skip);

  const flickrUrl = image ? UrlUtil.getFlickrUrl(image.to_path) : null;
  const acdUrl = image?.acd_id
    ? UrlUtil.getAcdUrl(image.acd_id, c.amazonCloudDriveDomain)
    : null;

  return (
    <>
      {image ? (
        <Box marginBottom={1}>
          <Paper elevation={1}>
            <Tooltip arrow title="download" placement="top-end">
              <IconButton
                onClick={async () => {
                  const { data } = await axios.get(
                    UrlUtil.generateImageUrl(image.hash),
                    {
                      responseType: "arraybuffer",
                    }
                  );
                  const href = Buffer.from(data, "binary").toString("base64");
                  const link = document.createElement("a");
                  link.href = `data:application/octet-stream;base64,${href}`;
                  link.download =
                    `download.${image.to_path
                      .split(".")
                      .pop()
                      ?.toLowerCase()}` || "jpg";
                  link.style.display = "none";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <GetApp />
              </IconButton>
            </Tooltip>
            <Tooltip
              classes={{ tooltip: classes.noMaxWidth }}
              arrow
              title={image.to_path}
              placement="top-end"
            >
              <IconButton
                onClick={() => {
                  copy(image.to_path);
                }}
              >
                <AssignmentReturned />
              </IconButton>
            </Tooltip>
            <Tooltip
              classes={{ tooltip: classes.noMaxWidth }}
              arrow
              title={image.hash}
              placement="top-end"
            >
              <IconButton
                onClick={() => {
                  copy(image.hash);
                }}
              >
                <Assignment />
              </IconButton>
            </Tooltip>
            <Tooltip
              classes={{ tooltip: classes.noMaxWidth }}
              arrow
              title={UrlUtil.generateImageUrl(image.hash)}
              placement="top-end"
            >
              <IconButton
                onClick={() => {
                  copy(UrlUtil.generateImageUrl(image.hash));
                }}
              >
                <Assignment />
              </IconButton>
            </Tooltip>
            {flickrUrl ? (
              <Tooltip arrow title="flickr" placement="top-end">
                <IconButton target="_blank" href={flickrUrl}>
                  <CameraAlt />
                </IconButton>
              </Tooltip>
            ) : null}
            {acdUrl ? (
              <Tooltip arrow title="Amazon Cloud Drive" placement="top-end">
                <IconButton target="_blank" href={acdUrl}>
                  <Cloud />
                </IconButton>
              </Tooltip>
            ) : null}
          </Paper>
        </Box>
      ) : null}
      <TableContainer component={Paper}>
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table"
        >
          {/*
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
      */}
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DataTable;
