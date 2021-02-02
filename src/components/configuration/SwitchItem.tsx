import React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

interface SwitchItemProps {
  value: boolean;
  label: string;
  name: string;
  onChange:
    | ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void)
    | undefined;
}

export default function SwitchItem({
  onChange,
  label,
  name,
  value,
}: SwitchItemProps) {
  return (
    <FormControlLabel
      control={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <Switch checked={value} onChange={onChange} name={name} />
      }
      label={label}
    />
  );
}
