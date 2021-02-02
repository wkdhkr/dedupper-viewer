import React, { useState } from "react";
import { Slider, Box, Typography, Paper } from "@material-ui/core";
import debounce from "lodash/debounce";
import { DedupperImage } from "../../../types/unistore";

type ColorTunerProps = {
  reset: number;
  image: DedupperImage | null;
  onUpdate: (kind: string, value: number) => void;
};

const ColorTuner: React.FunctionComponent<ColorTunerProps> = ({
  onUpdate,
  reset: srcReset,
  image,
}) => {
  const [isHover, setIsHover] = useState<boolean>(false);
  if (!image) {
    return <></>;
  }
  const reset = `${image.hash}_${srcReset}`;
  const createHandleChange = (kind: string) =>
    debounce(
      (e: any, value: number | number[]) => onUpdate(kind, value as any),
      1000
    );

  return (
    <Box
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        opacity: isHover ? 0.8 : 0,
      }}
    >
      <Paper>
        <Box m={2} style={{ userSelect: "none" }}>
          <Typography gutterBottom>Hue Rotation</Typography>
          <div>
            <Slider
              key={reset}
              onChange={createHandleChange("hue")}
              valueLabelDisplay="auto"
              defaultValue={0}
              step={1}
              min={0}
              max={360}
            />
          </div>
          <Typography gutterBottom>Contrast</Typography>
          <div>
            <Slider
              key={reset}
              onChange={createHandleChange("contrast")}
              valueLabelDisplay="auto"
              defaultValue={100}
              step={1}
              min={0}
              max={200}
            />
          </div>
          <Typography gutterBottom>Saturate</Typography>
          <div>
            <Slider
              key={reset}
              onChange={createHandleChange("saturate")}
              valueLabelDisplay="auto"
              defaultValue={100}
              step={1}
              min={0}
              max={200}
            />
          </div>
          <Typography gutterBottom>Brightness</Typography>
          <div>
            <Slider
              key={reset}
              onChange={createHandleChange("brightness")}
              valueLabelDisplay="auto"
              defaultValue={100}
              step={1}
              min={0}
              max={200}
            />
          </div>
        </Box>
      </Paper>
    </Box>
  );
};

export default ColorTuner;
