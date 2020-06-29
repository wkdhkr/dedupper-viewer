import React, { useState } from "react";
import {
  Button,
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@material-ui/core";
import SlideUp from "../../transitions/SlideUp";
import { ConfigurationState } from "../../types/unistore";
import SliderItem from "./SliderItem";
import SwitchItem from "./SwitchItem";
import ConfigurationHelper from "../../helpers/ConfigurationHelper";
import IFrameUtil from "../../utils/IFrameUtil";

type ConfigurationDialogProps = {
  configuration: ConfigurationState;
  updateFn: (c: ConfigurationState) => void;
};

const ConfigurationDialog: React.FunctionComponent<ConfigurationDialogProps> = ({
  configuration: c,
  updateFn
}) => {
  const [draftConfig, setDraftConfig] = useState<ConfigurationState>(c);
  const [reset, setReset] = useState<number>(0);

  const handleClose = () => {
    setDraftConfig(c); // reset
    updateFn({
      ...c,
      open: false
    });
  };

  const handleSave = () => {
    updateFn({
      ...c,
      ...draftConfig,
      open: false
    });
  };

  return (
    <Dialog
      style={{
        zIndex: 1360
      }}
      fullWidth
      onBackdropClick={handleClose}
      maxWidth="md"
      open={c.open}
      TransitionComponent={SlideUp as any}
    >
      <DialogTitle id="scroll-dialog-title">
        Dedupper Viewer Configuration
      </DialogTitle>
      <DialogContent dividers>
        <Grid container>
          <Grid item xs={12}>
            <form noValidate autoComplete="off">
              <Grid item xs={12}>
                {IFrameUtil.isInIFrame() ? (
                  <>
                    <h2>Viewer</h2>
                    <SliderItem
                      reset={reset}
                      title="Standard size - Width (restart required)"
                      step={2}
                      min={1024}
                      max={1920 * 2}
                      value={draftConfig.standardWidth}
                      onChange={(e, size) =>
                        setDraftConfig({
                          ...draftConfig,
                          standardWidth: size
                        })
                      }
                    />
                    <SliderItem
                      reset={reset}
                      title="Standard size - height (restart required)"
                      step={2}
                      min={1024}
                      max={1080 * 2}
                      value={draftConfig.standardHeight}
                      onChange={(e, size) =>
                        setDraftConfig({
                          ...draftConfig,
                          standardHeight: size
                        })
                      }
                    />
                    <h3>
                      Select the next image after editing the current image
                    </h3>
                    <SwitchItem
                      onChange={(e, value) =>
                        setDraftConfig({
                          ...draftConfig,
                          selectNextAfterEditInMainViewer: value
                        })
                      }
                      name="selectNextAfterEditInMainViewer"
                      label="Main"
                      value={draftConfig.selectNextAfterEditInMainViewer}
                    />
                    <SwitchItem
                      onChange={(e, value) =>
                        setDraftConfig({
                          ...draftConfig,
                          selectNextAfterEditInGridViewer: value
                        })
                      }
                      key={reset}
                      name="selectNextAfterEditInGridViewer"
                      label="Grid"
                      value={draftConfig.selectNextAfterEditInGridViewer}
                    />
                    <h2>Sub Viewer</h2>
                    <SwitchItem
                      onChange={(e, value) =>
                        setDraftConfig({
                          ...draftConfig,
                          enableSubViewer: value
                        })
                      }
                      name="enableSubViewer"
                      label="Enable"
                      value={draftConfig.enableSubViewer}
                    />
                    <h2>Slideshow</h2>
                    <SwitchItem
                      onChange={(e, value) =>
                        setDraftConfig({
                          ...draftConfig,
                          autoReload: value
                        })
                      }
                      name="autoReload"
                      label="Auto reload"
                      value={draftConfig.autoReload}
                    />
                    <SwitchItem
                      onChange={(e, value) =>
                        setDraftConfig({
                          ...draftConfig,
                          recordPlayStatistics: value
                        })
                      }
                      name="recordPlayStatistics"
                      label="Record play statistics"
                      value={draftConfig.recordPlayStatistics}
                    />
                    <SliderItem
                      reset={reset}
                      title="Interval sec - Main"
                      step={0.1}
                      min={1}
                      max={120}
                      value={draftConfig.mainViewerPlayInterval}
                      onChange={(e, sec) =>
                        setDraftConfig({
                          ...draftConfig,
                          mainViewerPlayInterval: sec
                        })
                      }
                    />
                    <SliderItem
                      reset={reset}
                      title="Interval sec - Grid"
                      step={0.1}
                      min={1}
                      max={120}
                      value={draftConfig.gridViewerPlayInterval}
                      onChange={(e, sec) => {
                        setDraftConfig({
                          ...draftConfig,
                          gridViewerPlayInterval: sec
                        });
                      }}
                    />
                    <SliderItem
                      reset={reset}
                      title="Random horizontal flip probability"
                      step={1}
                      min={0}
                      max={100}
                      value={draftConfig.flipRandomInPlay}
                      onChange={(e, p) =>
                        setDraftConfig({
                          ...draftConfig,
                          flipRandomInPlay: p
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <h2>Global Viewer</h2>
                    <TextField
                      value={draftConfig.iframeOrigin}
                      onChange={e => {
                        setDraftConfig({
                          ...draftConfig,
                          iframeOrigin: e.target.value
                        });
                      }}
                      label="Inline frame origin"
                    />
                  </>
                )}
              </Grid>
            </form>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setReset(reset + 1);
            setDraftConfig(ConfigurationHelper.getInitialState());
          }}
          color="primary"
        >
          Reset
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigurationDialog;
