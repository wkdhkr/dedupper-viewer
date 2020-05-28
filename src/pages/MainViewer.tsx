import React from "react";
import Hotkeys from "react-hot-keys";
import { LinearProgress, Dialog, Box } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import { Label } from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";

import * as colors from "@material-ui/core/colors";
import Slide from "@material-ui/core/Slide";
import { RouteComponentProps } from "@reach/router";
import "./MainViewer.css";

import { MultiImageViewer } from "../components/viewer";
import { MainViewerState, DedupperImage } from "../types/unistore";
import DataTable from "../components/viewer/DataTable";

type MainViewerProps = MainViewerState & {
  unload: () => void;
  load: (channelId: string) => Promise<void>;
  channelId?: string;
  updateTag: (hash: string, x: number | null, name: string) => Promise<void>;
  updateRating: (hash: string, x: number | null) => Promise<void>;
  togglePlay: Function;
} & RouteComponentProps;

interface MainViewerRatingProps {
  currentImage: DedupperImage | null;
  onRatingChange: (hash: string, x: number | null) => Promise<void>;
  onTagChange: (hash: string, x: number | null, name: string) => Promise<void>;
}

const getColor = (name: string, isHover = false) => {
  let color = null;
  if (name === "t1") {
    color = isHover ? colors.red.A400 : colors.red[400];
  }
  if (name === "t2") {
    color = isHover ? colors.yellow.A400 : colors.yellow[400];
  }
  if (name === "t3") {
    color = isHover ? colors.green.A400 : colors.green[400];
  }
  if (name === "t4") {
    color = isHover ? colors.blue.A400 : colors.blue[400];
  }
  if (name === "t5") {
    color = isHover ? colors.purple.A400 : colors.purple[400];
  }
  if (!color) {
    throw new Error("unknown tag name.");
  }
  return color;
};

const getLabelRating = (name: string) =>
  withStyles({
    iconFilled: {
      color: getColor(name)
    },
    iconHover: {
      color: getColor(name, true)
    }
  })(Rating);

const Transition: any = React.forwardRef(function Transition(props: any, ref) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />;
});

const MainViewerRating: React.SFC<MainViewerRatingProps> = ({
  currentImage,
  onRatingChange,
  onTagChange
}) => {
  if (currentImage) {
    return (
      <>
        <Box>
          <Rating
            value={currentImage.rating}
            name="image"
            onChange={(event, value) =>
              onRatingChange(currentImage.hash, value)
            }
            max={5}
          />
        </Box>
        <Box>
          {["t1", "t2", "t3", "t4", "t5"].map(name => {
            const LabelRating = getLabelRating(name);
            return (
              <LabelRating
                key={name}
                value={(currentImage as any)[name]}
                icon={<Label fontSize="inherit" />}
                name={name}
                onChange={(event, value) =>
                  onTagChange(currentImage.hash, value, name)
                }
                max={1}
              />
            );
          })}
        </Box>
      </>
    );
  }

  return <></>;
};

const MainViewer: React.SFC<MainViewerProps> = ({
  isPlay,
  load,
  unload,
  isLoading,
  channelId,
  currentImage,
  index,
  images,
  updateTag,
  updateRating,
  togglePlay
}) => {
  return (
    <>
      {!isPlay && (
        <Box style={{ opacity: 0.4 }} position="fixed" zIndex="1400" m={2}>
          <MainViewerRating
            currentImage={currentImage}
            onTagChange={updateTag}
            onRatingChange={updateRating}
          />
        </Box>
      )}
      <Box
        id="viewer-data-table"
        style={{ opacity: "0.0" }}
        position="fixed"
        left="6px"
        bottom="6px"
        zIndex="1400"
      >
        <DataTable
          index={index}
          imageCount={images.length}
          image={currentImage}
        />
      </Box>
      <Hotkeys
        keyName="d,s,a,c,w,f"
        onKeyUp={(keyName: string) => {
          if (currentImage) {
            const update = (rating: number) => {
              const newRating = currentImage.rating === rating ? 0 : rating;
              updateRating(currentImage.hash, newRating);
            };
            switch (keyName) {
              case "s":
                // special
                update(5);
                break;
              case "f":
                // fantastic
                update(4);
                break;
              case "w":
                // wonder
                update(3);
                break;
              case "a":
                // accept
                update(2);
                break;
              case "c":
                // common
                update(1);
                break;
              case "d":
                // deny
                updateTag(currentImage.hash, currentImage.t1 ? null : 1, "t1");
                break;
              default:
            }
          }
        }}
      >
        <Dialog fullScreen open TransitionComponent={Transition}>
          {isLoading && <LinearProgress color="secondary" />}
          <MultiImageViewer
            load={async () => {
              if (channelId) {
                load(channelId);
              }
            }}
            unload={unload}
            isPlay={isPlay}
            togglePlay={togglePlay}
            images={images}
          />
        </Dialog>
      </Hotkeys>
    </>
  );
};
export default MainViewer;
