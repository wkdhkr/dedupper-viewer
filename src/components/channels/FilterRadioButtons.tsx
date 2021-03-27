import React from "react";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

export type ChannelFilter = "portrait" | "landscape" | "none";

type FilterRadioButtonsProps = {
  value: ChannelFilter;
  onChange: (v: ChannelFilter) => void;
};

const FilterRadioButtons: React.FunctionComponent<FilterRadioButtonsProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange((event.target as HTMLInputElement).value as ChannelFilter);
  };

  return (
    <FormControl component="fieldset">
      {/* <FormLabel component="legend">Filter</FormLabel> */}
      <RadioGroup
        row
        aria-label="filter"
        name="filter"
        value={value}
        onChange={handleChange}
      >
        <FormControlLabel
          value="portrait"
          control={<Radio />}
          label="Portrait"
        />
        <FormControlLabel
          value="landscape"
          control={<Radio />}
          label="Landscape"
        />
        <FormControlLabel value="none" control={<Radio />} label="None" />
      </RadioGroup>
    </FormControl>
  );
};

export default FilterRadioButtons;
