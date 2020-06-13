import React from "react";
import Slider from "@material-ui/core/Slider";
import { Box } from "@material-ui/core";

function valuetext(value: number) {
  return `${value} sec`;
}

interface SliderItemProps {
  step: number;
  reset: number;
  min: number;
  max: number;
  title?: string;
  onChange: ((event: React.ChangeEvent<{}>, value: number) => void) | undefined;
  value: number;
}

const SliderItem: React.FunctionComponent<SliderItemProps> = ({
  reset,
  step,
  min,
  max,
  title,
  onChange,
  value
}) => {
  return (
    <>
      {title ? <h3>{title}</h3> : null}
      <Box marginTop={5}>
        <Slider
          key={reset}
          onChange={onChange as any}
          valueLabelDisplay="on"
          defaultValue={value}
          getAriaValueText={valuetext}
          aria-labelledby="discrete-slider"
          step={step}
          marks
          min={min}
          max={max}
        />
      </Box>
    </>
  );
};

export default SliderItem;
