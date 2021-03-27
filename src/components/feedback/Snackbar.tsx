import React from "react";
import { useSnackbar, OptionsObject, SnackbarOrigin } from "notistack";
import {
  SnackbarState,
  SnackbarKind,
  SnackbarCustomState,
} from "../../types/unistore";

type SnackbarProps = {
  anchorOrigin: SnackbarOrigin;
  state: SnackbarState;
  close: (x: SnackbarKind) => void;
  stateCustom: SnackbarCustomState;
  closeCustom: () => void;
};

const Snackbar: React.FunctionComponent<SnackbarProps> = ({
  anchorOrigin,
  state,
  close,
  stateCustom,
  closeCustom,
}) => {
  const snackbarConfigLookup: {
    [_ in SnackbarKind]: [React.ReactNode, OptionsObject | undefined];
  } = {
    tagUpdated: [
      "The tag has been updated.",
      {
        variant: "success",
        disableWindowBlurListener: true,
        autoHideDuration: 3000,
        anchorOrigin,
      },
    ],
    ratingUpdated: [
      "The rating has been updated.",
      {
        variant: "success",
        disableWindowBlurListener: true,
        autoHideDuration: 3000,
        anchorOrigin,
      },
    ],
    layoutUpdated: [
      "The layout has been updated.",
      {
        variant: "success",
        disableWindowBlurListener: true,
        autoHideDuration: 3000,
        anchorOrigin,
      },
    ],
  };

  const { enqueueSnackbar } = useSnackbar();

  (Object.keys(state) as (keyof SnackbarState)[]).forEach(
    (key: SnackbarKind) => {
      if (state[key]) {
        setTimeout(() => {
          enqueueSnackbar(...snackbarConfigLookup[key]);
          close(key);
        });
      }
    }
  );
  if (stateCustom) {
    setTimeout(() => {
      enqueueSnackbar(...stateCustom);
      closeCustom();
    });
  }
  return <div />;
};
export default Snackbar;
