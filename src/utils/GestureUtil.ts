import { GestureInfo } from "../types/unistore";

export default class GestureUtil {
  static detectRating = (
    e: React.MouseEvent | MouseEvent,
    gestureInfo: GestureInfo
  ) => {
    const { image: gestureImage, x: prevX, y: prevY } = gestureInfo;
    const moveX = e.clientX - prevX;
    const moveY = e.clientY - prevY;
    const isVertical = Math.abs(moveY) > Math.abs(moveX);
    const move = isVertical ? moveY : moveX;
    const isPositive = move > 0;
    const hash = gestureImage?.hash;
    if (hash && Math.abs(move) > 32) {
      let rating: number | null = null;
      if (isVertical) {
        rating = isPositive ? 4 : 1;
      } else {
        rating = isPositive ? 3 : 2;
      }
      if (gestureImage?.rating === rating) {
        rating = 0;
      }
      return rating;
    }
    return null;
  };
}
