import React from "react";
import Hotkeys from "react-hot-keys";
import { DedupperImage } from "../../../types/unistore";

interface RatingAndTagHotkeyProps {
  next?: boolean;
  image: DedupperImage | null;
  updateTag: (
    hash: string,
    x: number | null,
    name: string,
    next?: boolean
  ) => void;
  updateRating: (hash: string, x: number | null, next?: boolean) => void;
}

const RatingAndTagHotkey: React.FunctionComponent<RatingAndTagHotkeyProps> = ({
  next = true,
  image,
  updateRating,
  updateTag,
}) => {
  return (
    <Hotkeys
      allowRepeat={false}
      keyName="d,s,a,c,w,f,1,2,3,4,5,space"
      onKeyDown={(keyName: string, event: KeyboardEvent) => {
        event.preventDefault();
      }}
      onKeyUp={(keyName: string) => {
        if (image) {
          const update = (rating: number) => {
            const newRating = image.rating === rating ? 0 : rating;
            updateRating(image.hash, newRating, next);
          };
          switch (keyName) {
            case "5":
            case "s":
              // special
              update(5);
              break;
            case "4":
            case "f":
              // fantastic
              update(4);
              break;
            case "3":
            case "w":
              // wonder
              update(3);
              break;
            case "2":
            case "a":
              // accept
              update(2);
              break;
            case "1":
            case "c":
              // common
              update(1);
              break;
            case "space":
            // eslint-disable-next-line no-fallthrough
            case "d":
              // deny
              updateTag(image.hash, image.t1 ? null : 1, "t1", next);
              break;
            default:
          }
        }
      }}
    />
  );
};

export default RatingAndTagHotkey;
