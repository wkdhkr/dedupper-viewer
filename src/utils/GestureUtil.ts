import { GestureInfo } from "../types/unistore";

export default class GestureUtil {
  static detectDiagonalFlags = (
    e: React.MouseEvent | MouseEvent,
    gestureInfo: GestureInfo
  ) => {
    const { image: gestureImage, x: prevX, y: prevY } = gestureInfo;
    const hash = gestureImage?.hash;
    if (!hash) {
      return null;
    }
    const moveX = e.clientX - prevX;
    const moveY = e.clientY - prevY;
    const isMoveHorizontal = Math.abs(moveX) > 40;
    const isMoveVertical = Math.abs(moveY) > 40;
    const isPositiveHorizontal = moveX > 0;
    const isPositiveVertical = moveY > 0;

    const isLeftMove = !isPositiveHorizontal && isMoveHorizontal;
    const isRightMove = isPositiveHorizontal && isMoveHorizontal;
    const isTopMove = !isPositiveVertical && isMoveVertical;
    const isBottomMove = isPositiveVertical && isMoveVertical;

    const isLeftTopMove = isLeftMove && isTopMove;
    const isLeftBottomMove = isLeftMove && isBottomMove;
    const isRightTopMove = isRightMove && isTopMove;
    const isRightBottomMove = isRightMove && isBottomMove;

    if (
      [isLeftTopMove, isLeftBottomMove, isRightTopMove, isRightBottomMove].some(
        Boolean
      )
    ) {
      return {
        isLeftTopMove,
        isLeftBottomMove,
        isRightTopMove,
        isRightBottomMove,
      };
    }
    return null;
  };

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
      if (gestureImage?.rating === 4 && rating === 4) {
        rating = 5;
      } else if (gestureImage?.rating === rating) {
        rating = 0;
      } else if (gestureImage?.rating === 5 && rating === 4) {
        rating = 0;
      }
      return rating;
    }
    return null;
  };
}
