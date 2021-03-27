import React, { useState } from "react";
import * as colors from "@material-ui/core/colors";
import { Box, Tooltip } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import { withStyles } from "@material-ui/core/styles";
import { DeleteForever, Label } from "@material-ui/icons";
import { DedupperImage } from "../../../types/unistore";
import { TAGS } from "../../../constants/dedupperConstants";

const getColor = (name: string, isHover = false) => {
  let color = null;
  if (name === "t1") {
    color = isHover ? colors.red.A200 : colors.red[200];
  }
  if (name === "t2") {
    color = isHover ? colors.red.A400 : colors.red[400];
  }
  if (name === "t3") {
    color = isHover ? colors.yellow.A400 : colors.yellow[400];
  }
  if (name === "t4") {
    color = isHover ? colors.green.A400 : colors.green[400];
  }
  if (name === "t5") {
    color = isHover ? colors.blue.A400 : colors.blue[400];
  }
  if (name === "t6") {
    color = isHover ? colors.purple.A400 : colors.purple[400];
  }
  if (name === "t7") {
    color = isHover ? colors.deepOrange.A400 : colors.deepOrange[400];
  }
  if (name === "t8") {
    color = isHover ? colors.orange.A400 : colors.orange[400];
  }
  if (name === "t9") {
    color = isHover ? colors.lightGreen.A400 : colors.lightGreen[400];
  }
  if (name === "t10") {
    color = isHover ? colors.cyan.A400 : colors.cyan[400];
  }
  if (name === "t11") {
    color = isHover ? colors.deepPurple.A400 : colors.deepPurple[400];
  }
  if (!color) {
    throw new Error("unknown tag name.");
  }
  return color;
};

const getLabelRating = (name: string) =>
  withStyles({
    iconFilled: {
      color: getColor(name),
    },
    iconHover: {
      color: getColor(name, true),
    },
  })(Rating);

const labelRatingList = TAGS.map((name) => getLabelRating(name));

interface RatingAndTagProps {
  next?: boolean;
  currentImage: DedupperImage | null;
  onRatingChange: (hash: string, x: number | null, next?: boolean) => void;
  onTagChange: (
    hash: string,
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
}

const Tag = React.memo(
  ({
    hash,
    name,
    currentValue,
    onTagChange,
    next = false,
  }: {
    hash: string;
    name: string;
    currentValue: number | null;
    next: boolean;
    onTagChange: (
      hash: string,
      x: number | null,
      name: string,
      next?: boolean
    ) => void;
  }) => {
    const LabelRating =
      labelRatingList[parseInt(name.replace("t", ""), 10) - 1];
    return (
      <Tooltip placement="top" title={name === "t1" ? "Delete flag" : name}>
        <LabelRating
          value={currentValue || 0}
          icon={
            name === "t1" ? (
              <DeleteForever fontSize="inherit" />
            ) : (
              <Label fontSize="inherit" />
            )
          }
          name={`tag__${name}__${hash}`}
          onChange={(event, value) =>
            onTagChange(hash, value, name, name === "t1" ? next : false)
          }
          max={1}
        />
      </Tooltip>
    );
  }
);

const RatingAndTag: React.FunctionComponent<RatingAndTagProps> = React.memo(
  ({ next, currentImage, onRatingChange, onTagChange }) => {
    const [hover, setHover] = useState(-1);
    if (currentImage) {
      return (
        <>
          <Box className="viewer-rating-container">
            <Tag
              currentValue={currentImage.t1}
              hash={currentImage.hash}
              next={Boolean(next)}
              onTagChange={onTagChange}
              name="t1"
            />
            <Tooltip
              title={`Rating: ${hover === -1 ? "?" : hover}`}
              placement="bottom"
            >
              <Rating
                onChangeActive={(event, newHover) => setHover(newHover)}
                value={currentImage.rating}
                name={`image__${currentImage.hash}`}
                onChange={(event, value) =>
                  onRatingChange(currentImage.hash, value, next)
                }
                max={5}
              />
            </Tooltip>
          </Box>
          <Box className="viewer-tag-container">
            {(["t2", "t3", "t4", "t5", "t6"] as const).map((name) => {
              return (
                <Tag
                  key={name}
                  currentValue={currentImage[name]}
                  hash={currentImage.hash}
                  next={Boolean(next)}
                  onTagChange={onTagChange}
                  name={name}
                />
              );
            })}
          </Box>
          <Box className="viewer-tag-container">
            {(["t7", "t8", "t9", "t10", "t11"] as const).map((name) => {
              return (
                <Tag
                  key={name}
                  currentValue={currentImage[name]}
                  hash={currentImage.hash}
                  next={Boolean(next)}
                  onTagChange={onTagChange}
                  name={name}
                />
              );
            })}
          </Box>
        </>
      );
    }

    return <></>;
  },
  (p, n) => {
    const { currentImage: pi } = p;
    const { currentImage: ni } = n;
    if (pi && ni) {
      if (pi.hash === ni.hash && pi.rating === ni.rating) {
        if (TAGS.every((t) => pi[t] === ni[t])) {
          return true;
        }
      }
    }
    return false;
  }
);

export default RatingAndTag;
