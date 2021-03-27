import React, { useState } from "react";
import {
  Button,
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
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

const ConfigurationDialog: React.FunctionComponent<ConfigurationDialogProps> = React.memo(
  ({ configuration: c, updateFn }) => {
    const [draftConfig, setDraftConfig] = useState<ConfigurationState>(c);
    const [reset, setReset] = useState<number>(0);

    const handleClose = () => {
      setDraftConfig(c); // reset
      updateFn({
        ...c,
        open: false,
      });
    };

    const handleSave = () => {
      const modConfig: { dedupperServerPort?: number } = {};
      if (!draftConfig.dedupperServerPort) {
        modConfig.dedupperServerPort = 8080;
      }
      updateFn({
        ...c,
        ...draftConfig,
        ...modConfig,
        open: false,
      });
    };

    const keyboardShortcuts = [
      {
        name: "Rating 1(common)",
        value: "1,c",
      },
      {
        name: "Rating 2(accept)",
        value: "2,a",
      },
      {
        name: "Rating 3(wonder)",
        value: "3,w",
      },
      {
        name: "Rating 4(fantastic)",
        value: "4,f",
      },
      {
        name: "Rating 5(special)",
        value: "5,s",
      },
      {
        name: "tag 1(deny)",
        value: "space,d",
      },
      {
        name: "toggle Fullscreen",
        value: "m",
      },
      {
        name: "Change grid count",
        value: "g",
      },
      {
        name: "Reload",
        value: "r",
      },
      {
        name: "Toggle play",
        value: "p",
      },
      {
        name: "Apply tag(block)",
        value: "x",
      },
    ];

    return (
      <Dialog
        style={{
          zIndex: 1360,
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
                  <>
                    <h2>Dedupper Server</h2>
                    <h3>Port</h3>
                    <TextField
                      value={draftConfig.dedupperServerPort || ""}
                      onChange={(e) => {
                        setDraftConfig({
                          ...draftConfig,
                          dedupperServerPort: parseInt(e.target.value, 10) || 0,
                        });
                      }}
                      label="port (restart required)"
                    />
                    <h3>Protocol</h3>
                    <RadioGroup
                      name="protocol"
                      row
                      value={draftConfig.dedupperServerProtocol}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setDraftConfig({
                          ...draftConfig,
                          dedupperServerProtocol: (event.target as HTMLInputElement)
                            .value as any,
                        });
                      }}
                    >
                      <FormControlLabel
                        value="https"
                        control={<Radio />}
                        label="https"
                      />
                      <FormControlLabel
                        value="http"
                        control={<Radio />}
                        label="http"
                      />
                    </RadioGroup>
                  </>
                  {IFrameUtil.isInIFrame() ? (
                    <>
                      <h2>Viewer</h2>
                      <SliderItem
                        reset={reset}
                        title="thumbnail width for portrait image"
                        step={1}
                        min={120}
                        max={512}
                        value={draftConfig.thumbWidthForPortrait}
                        onChange={(e, size) =>
                          setDraftConfig({
                            ...draftConfig,
                            thumbWidthForPortrait: size,
                          })
                        }
                      />
                      <SliderItem
                        reset={reset}
                        title="thumbnail width for landscape image"
                        step={1}
                        min={120}
                        max={512}
                        value={draftConfig.thumbWidthForLandscape}
                        onChange={(e, size) =>
                          setDraftConfig({
                            ...draftConfig,
                            thumbWidthForLandscape: size,
                          })
                        }
                      />
                      <SliderItem
                        reset={reset}
                        title="Standard size - width (restart required)"
                        step={2}
                        min={1024}
                        max={1920 * 2}
                        value={draftConfig.standardWidth}
                        onChange={(e, size) =>
                          setDraftConfig({
                            ...draftConfig,
                            standardWidth: size,
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
                            standardHeight: size,
                          })
                        }
                      />
                      <h3>Amazon Cloud Drive</h3>
                      <TextField
                        value={draftConfig.amazonCloudDriveDomain}
                        onChange={(e) => {
                          setDraftConfig({
                            ...draftConfig,
                            amazonCloudDriveDomain:
                              e.target.value || "www.amazon.com",
                          });
                        }}
                        label="Domain"
                      />
                      <h3>Face++</h3>
                      <RadioGroup
                        name="face++"
                        row
                        value={draftConfig.showFacePP}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          setDraftConfig({
                            ...draftConfig,
                            showFacePP: (event.target as HTMLInputElement)
                              .value as any,
                          });
                        }}
                      >
                        <FormControlLabel
                          value="hover"
                          control={<Radio />}
                          label="hover"
                        />
                        <FormControlLabel
                          value="always"
                          control={<Radio />}
                          label="always"
                        />
                        <FormControlLabel
                          value="none"
                          control={<Radio />}
                          label="none"
                        />
                      </RadioGroup>
                      <h3>
                        Select the next image after editing the current image
                      </h3>
                      <SwitchItem
                        onChange={(e, value) =>
                          setDraftConfig({
                            ...draftConfig,
                            selectNextAfterEditInMainViewer: value,
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
                            selectNextAfterEditInGridViewer: value,
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
                            enableSubViewer: value,
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
                            autoReload: value,
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
                            recordPlayStatistics: value,
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
                            mainViewerPlayInterval: sec,
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
                            gridViewerPlayInterval: sec,
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
                            flipRandomInPlay: p,
                          })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <h2>Global Viewer</h2>
                      <TextField
                        value={draftConfig.iframeOrigin}
                        onChange={(e) => {
                          setDraftConfig({
                            ...draftConfig,
                            iframeOrigin: e.target.value,
                          });
                        }}
                        label="Inline frame origin"
                      />
                    </>
                  )}
                  <h2>Keyboard Shortcut</h2>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        {keyboardShortcuts.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell align="right">{row.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
  },
  (p, n) => {
    if (p.configuration.open === false && n.configuration.open === false) {
      return true;
    }
    return false;
  }
);

export default ConfigurationDialog;
