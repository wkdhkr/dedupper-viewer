/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  DialogContent,
  DialogActions,
  Button,
  DialogTitle,
} from "@material-ui/core";
import { blue, pink, green } from "@material-ui/core/colors";
import { FacePPRow, DedupperImage } from "../../types/unistore";
import ViewerUtil from "../../utils/ViewerUtil";
import { ImageData } from "../../types/viewer";
import DomUtil from "../../utils/DomUtil";
import SlideUp from "../../transitions/SlideUp";
import usePrevious from "../../hooks/previous";

type HudLayerProps = {
  updateTag: (hash: string, x: number | null, name: string) => void;
  mode: "hover" | "always" | "none";
  faces: FacePPRow[];
  image: DedupperImage | null;
  hide?: boolean;
  disabled?: boolean;
};

const getEmotionEmoji = (face: FacePPRow) => {
  const maxValue = Math.max(
    face.emotion_anger,
    face.emotion_disgust,
    face.emotion_fear,
    face.emotion_happiness,
    face.emotion_sadness,
    face.emotion_surprise
  );
  const isAnger = maxValue === face.emotion_anger;
  const isDisgust = maxValue === face.emotion_disgust;
  const isFear = maxValue === face.emotion_fear;
  const isHappiness = maxValue === face.emotion_happiness;
  const isNeutral = maxValue === face.emotion_neutral;
  const isSadness = maxValue === face.emotion_sadness;
  const isSurprise = maxValue === face.emotion_surprise;

  const render = (emoji: string) => (
    <span aria-label="emoji" role="img">
      {emoji}
    </span>
  );

  if (isAnger) {
    return render("😠");
  }
  if (isDisgust) {
    return render("😟");
  }
  if (isFear) {
    return render("😨");
  }
  if (isHappiness) {
    return render("😊");
  }
  if (isNeutral) {
    return render("😐");
  }
  if (isSadness) {
    return render("😔");
  }
  if (isSurprise) {
    return render("😲");
  }
  return render("😐");
};

const HudLayer: React.FunctionComponent<HudLayerProps> = ({
  updateTag,
  mode,
  faces,
  image,
  disabled,
}) => {
  const [hover, setHover] = useState<boolean>(false);
  const [hoverFace, setHoverFace] = useState<string | null>(null);
  const [selectedFace, setSelectedFace] = useState<FacePPRow | null>(null);

  const prevImage = usePrevious(image);
  const isImageChanged = prevImage?.hash !== image?.hash;

  useEffect(() => {
    if (isImageChanged) {
      setHover(false);
      setHoverFace(null);
    }
  }, [isImageChanged, hover, hoverFace]);

  const hoverFaceFixed = faces
    .map((face) => face.face_token)
    .includes(hoverFace || "")
    ? hoverFace
    : null;

  if (!image || disabled) {
    return <></>;
  }

  const originalImageData: ImageData = image.trim
    ? JSON.parse(image.trim)
    : null;
  const imageData = originalImageData
    ? ViewerUtil.adjustImageData(originalImageData)
    : DomUtil.getViewerSafe()?.imageData;

  const boxStyle = {
    // eslint-disable-next-line no-nested-ternary
    opacity: mode === "hover" ? (hover ? 1 : 0) : 1,
    pointerEvents: "none" as "none",
    height: imageData ? imageData.height : 0,
    width: imageData ? imageData.width : 0,
    marginTop: imageData ? imageData.top || 0 : 0,
    marginLeft: imageData ? imageData.left || 0 : 0,
    ...(imageData ? ViewerUtil.getTransforms(imageData) : {}),
  };

  if (!imageData) {
    return null;
  }
  if (faces.some((face) => face.hash !== image?.hash)) {
    return null;
  }

  const isFaceDialogOpen = Boolean(
    selectedFace && selectedFace.hash === image?.hash
  );

  return (
    <>
      <Dialog
        style={{
          zIndex: 1360,
        }}
        fullWidth
        onBackdropClick={() => setSelectedFace(null)}
        maxWidth="md"
        open={isFaceDialogOpen}
        TransitionComponent={SlideUp as any}
      >
        <DialogTitle>Face information</DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {selectedFace
                  ? Object.keys(selectedFace)
                      .map((name) => {
                        if (name === "landmark" || name === "hash") {
                          return null;
                        }
                        return (
                          <TableRow key={name}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{(selectedFace as any)[name]}</TableCell>
                          </TableRow>
                        );
                      })
                      .filter(Boolean)
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFace(null)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Box
        className="viewer-hud-layer-container"
        onContextMenu={(e: React.MouseEvent) => {
          e.preventDefault();
          setHover(false);
          if (image) {
            const value = image.t1 ? null : 1;
            updateTag(image.hash, value, "t1");
          }
        }}
        style={boxStyle}
        zIndex={1354}
        position="absolute"
      >
        {faces.map((face) => {
          if (face.hash !== image?.hash) {
            return null;
          }
          const { ratio } = imageData;
          const left = face.left * ratio;
          const top = face.top * ratio;
          const width = face.width * ratio;
          const height = face.height * ratio;

          if (Number.isNaN(height) || Number.isNaN(width)) {
            return null;
          }

          const faceStyle = {
            opacity: 0.4,
            pointerEvents:
              mode === "hover" ? ("auto" as "auto") : ("none" as "none"),
            position: "absolute" as "absolute",
            border: `2px solid ${
              face.gender === "Female" ? pink[500] : blue[500]
            }`,
            color: "white",
            left,
            top,
            width,
            height,
            transform: `rotate(${face.headpose_roll_angle}deg)`,
          };
          return (
            <div key={face.face_token}>
              {Array.from(new Set(face.landmark.split(";"))).map((landmark) => {
                const [x, y] = landmark.split(",");

                return (
                  <div
                    key={landmark}
                    style={{
                      pointerEvents: "none",
                      opacity: hoverFaceFixed === face.face_token ? 0.5 : 0,
                      background: green[500],
                      width: height * 0.01 || 1,
                      height: height * 0.01 || 1,
                      position: "absolute",
                      top: parseInt(y, 10) * ratio || 0,
                      left: parseInt(x, 10) * ratio || 0,
                    }}
                  />
                );
              })}
              <div
                style={faceStyle}
                onMouseLeave={() => setHover(false)}
                onMouseEnter={() => setHover(true)}
              >
                <div
                  onMouseLeave={() => setHoverFace(null)}
                  onMouseEnter={() => setHoverFace(face.face_token)}
                  onClick={() => setSelectedFace(face)}
                  style={{
                    pointerEvents: "auto",
                    cursor: "pointer",
                    background: "black",
                    position: "absolute",
                    fontSize: height * 0.07,
                    bottom: 0,
                    margin: "2px",
                  }}
                >
                  Age: {face.age} {getEmotionEmoji(face)}
                  <br />
                  Score: {Math.floor(face.beauty_male_score * 100) / 100}
                </div>
              </div>
            </div>
          );
        })}
      </Box>
    </>
  );
};

export default HudLayer;
