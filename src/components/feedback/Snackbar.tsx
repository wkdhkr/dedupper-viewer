import React from "react";
import { useSnackbar } from "notistack";

interface SnackbarProps {
  state: {
    layoutUpdated: boolean;
  };
  close: () => void;
}

const Snackbar: React.SFC<SnackbarProps> = ({ state, close }) => {
  const { enqueueSnackbar } = useSnackbar();

  if (state.layoutUpdated) {
    setTimeout(() => {
      enqueueSnackbar("The layout has been updated.", {
        variant: "success",
        autoHideDuration: 5000,
        anchorOrigin: {
          horizontal: "right",
          vertical: "top"
        }
      });
      close();
    });
  }
  return <div />;
};
export default Snackbar;
