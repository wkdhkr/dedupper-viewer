import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ViewerUtil from "../../utils/ViewerUtil";

interface UnitMenuProps {
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  onClick: (e: React.MouseEvent, n: number) => void;
  orientation: "portrait" | "landscape";
  anchorEl: HTMLElement | null | undefined;
}

const UnitMenu: React.FunctionComponent<UnitMenuProps> = ({
  anchorEl,
  orientation,
  onClick,
  onClose,
}) => {
  return (
    <Menu
      id="channel-unit-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      {ViewerUtil.detectAllowedUnit(orientation).map((n) => (
        <MenuItem key={n} onClick={(e) => onClick(e, n)}>
          {`Columns: ${n}`}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default UnitMenu;
