import React from "react";
import Gallery from "react-photo-gallery";
import { DedupperImage } from "../../types/unistore";
import {
  STANDARD_HEIGHT,
  STANDARD_WIDTH,
} from "../../constants/dedupperConstants";
import ViewerUtil from "../../utils/ViewerUtil";
import GridPhoto from "./GridPhoto";
import UrlUtil from "../../utils/dedupper/UrlUtil";

type TrimRotationPreviewProps = {
  // width: number;
  image: DedupperImage | null;
  disabled?: boolean;
};

const TrimRotationPreview: React.FunctionComponent<TrimRotationPreviewProps> = ({
  image,
  disabled,
}) => {
  if (disabled || image == null) {
    return <></>;
  }
  const isPortraitImage = ViewerUtil.isPortraitImage() === false; // rotate
  return (
    <Gallery
      renderImage={(props) => (
        <GridPhoto
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...{
            ...props,
            readOnly: true,
            image,
          }}
        />
      )}
      margin={0}
      // targetRowHeight={height}
      // columns={2}
      // direction="column"
      photos={[image].map(({ hash }) => ({
        key: hash,
        width: isPortraitImage ? STANDARD_HEIGHT : STANDARD_WIDTH,
        height: isPortraitImage ? STANDARD_WIDTH : STANDARD_HEIGHT,
        src: UrlUtil.generateImageUrl(image.hash),
      }))}
      onClick={(event, { photo }) => {
        if (photo.key) {
          if (event.button === 0) {
            // normal click
          }
        }
      }}
    />
  );
};

export default TrimRotationPreview;
