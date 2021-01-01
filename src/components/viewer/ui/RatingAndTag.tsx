import React from "react";
import * as colors from "@material-ui/core/colors";
import { Box } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import { withStyles } from "@material-ui/core/styles";
import { Label } from "@material-ui/icons";
import { DedupperImage } from "../../../types/unistore";

const getColor = (name: string, isHover = false) => {
  let color = null;
  if (name === "t1") {
    color = isHover ? colors.red.A400 : colors.red[400];
  }
  if (name === "t2") {
    color = isHover ? colors.yellow.A400 : colors.yellow[400];
  }
  if (name === "t3") {
    color = isHover ? colors.green.A400 : colors.green[400];
  }
  if (name === "t4") {
    color = isHover ? colors.blue.A400 : colors.blue[400];
  }
  if (name === "t5") {
    color = isHover ? colors.purple.A400 : colors.purple[400];
  }
  if (!color) {
    throw new Error("unknown tag name.");
  }
  return color;
};

const getLabelRating = (name: string) =>
  withStyles({
    iconFilled: {
      color: getColor(name)
    },
    iconHover: {
      color: getColor(name, true)
    }
  })(Rating);

const labelRatingList = ["t1", "t2", "t3", "t4", "t5"].map(name =>
  getLabelRating(name)
);

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
const RatingAndTag: React.FunctionComponent<RatingAndTagProps> = React.memo(
  ({ next, currentImage, onRatingChange, onTagChange }) => {
    if (currentImage) {
      return (
        <>
          <Box className="viewer-rating-container">
            <Rating
              value={currentImage.rating}
              name={`image__${currentImage.hash}`}
              onChange={(event, value) =>
                onRatingChange(currentImage.hash, value, next)
              }
              max={5}
            />
          </Box>
          <Box className="viewer-rating-container">
            {["t1", "t2", "t3", "t4", "t5"].map(name => {
              const LabelRating =
                labelRatingList[parseInt(name.replace("t", ""), 10) - 1];
              return (
                <LabelRating
                  key={name}
                  value={(currentImage as any)[name]}
                  icon={<Label fontSize="inherit" />}
                  name={`tag__${name}__${currentImage.hash}`}
                  onChange={(event, value) =>
                    onTagChange(currentImage.hash, value, name, next)
                  }
                  max={1}
                />
              );
            })}
          </Box>
        </>
      );
    }

    return <></>;
  }
);

export default RatingAndTag;
