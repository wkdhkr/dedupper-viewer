import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import orderBy from "lodash/orderBy";
import filesize from "filesize.js";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
// import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { DedupperImage } from "../../types/unistore";

const useStyles = makeStyles({
  table: {
    maxWidth: 640
  }
});

interface DataTableProps {
  index: number;
  imageCount: number;
  image: DedupperImage | null;
}

const DataTable: React.FunctionComponent<DataTableProps> = ({
  image,
  index,
  imageCount
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
    { name: "index", value: `${index + 1}/${imageCount}` },
    { name: "date", value: new Date(image.timestamp).toLocaleDateString() },
    { name: "size", value: filesize(image.size) },
    { name: "resolution", value: `${image.width}x${image.height}` },
    {
      name: "extension",
      value:
        image.to_path
          .split(".")
          .pop()
          ?.toLowerCase() || "N/A"
    },
    ...orderBy(
      [
        { name: "neutral", value: image.neutral },
        { name: "porn", value: image.porn },
        { name: "hentai", value: image.hentai },
        { name: "sexy", value: image.sexy },
        { name: "drawing", value: image.drawing }
      ],
      ["value"],
      ["desc"]
    ),
    { name: "porn_sexy", value: image.porn_sexy },
    { name: "hentai_porn", value: image.hentai_porn },
    { name: "hentai_porn_sexy", value: image.hentai_porn_sexy }
  ];

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
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
          {rows.map(row => (
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
  );
};

export default DataTable;
