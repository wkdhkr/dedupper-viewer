import React from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Dialog
} from "@material-ui/core";

type ConfirmDialogProps = {
  text: string;
  open: boolean;
  handleClose: (event: any) => void;
  handleOk: (event: any) => void;
  title: string;
};

const ConfirmDialog: React.FunctionComponent<ConfirmDialogProps> = ({
  text,
  title,
  handleClose,
  handleOk,
  open
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="secondary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
