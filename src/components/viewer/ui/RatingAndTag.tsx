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

interface RatingAndTagProps {
  currentImage: DedupperImage | null;
  onRatingChange: (hash: string, x: number | null) => void;
  onTagChange: (hash: string, x: number | null, name: string) => void;
}
const RatingAndTag: React.FunctionComponent<RatingAndTagProps> = ({
  currentImage,
  onRatingChange,
  onTagChange
}) => {
  if (currentImage) {
    return (
      <>
        <Box className="viewer-rating-container">
          <Rating
            value={currentImage.rating}
            name={`image__${currentImage.hash}`}
            onChange={(event, value) =>
              onRatingChange(currentImage.hash, value)
            }
            max={5}
          />
        </Box>
        <Box className="viewer-rating-container">
          {["t1", "t2", "t3", "t4", "t5"].map(name => {
            const LabelRating = getLabelRating(name);
            return (
              <LabelRating
                key={name}
                value={(currentImage as any)[name]}
                icon={<Label fontSize="inherit" />}
                name={`tag__${name}__${currentImage.hash}`}
                onChange={(event, value) =>
                  onTagChange(currentImage.hash, value, name)
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
};

export default RatingAndTag;
