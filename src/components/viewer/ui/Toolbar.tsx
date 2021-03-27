/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from "react";
import SubViewerHelper from "../../../helpers/viewer/SubViewerHelper";
import IFrameUtil from "../../../utils/IFrameUtil";

type ToolbarProps = {};

const Toolbar: React.FunctionComponent<ToolbarProps> = React.memo(() => {
  const handleClick = async (
    e: React.MouseEvent,
    kind: string,
    isContextMenu = false
  ) => {
    e.preventDefault();
    await SubViewerHelper.prepareReference();
    IFrameUtil.postMessageForOther({
      type: "toolbarClicked",
      payload: {
        kind,
        isContextMenu,
      },
    });
  };
  return (
    <div
      style={{ zIndex: 1355, pointerEvents: "none" }}
      className="viewer-container"
    >
      <div className="viewer-footer">
        <div className="viewer-toolbar">
          <ul style={{ pointerEvents: "auto" }}>
            <li
              role="button"
              onClick={(e) => handleClick(e, "zoom-in")}
              onContextMenu={(e) => handleClick(e, "zoom-in", true)}
              className="viewer-zoom-in viewer-large"
              data-viewer-action="zoom-in"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "zoom-out")}
              onContextMenu={(e) => handleClick(e, "zoom-out", true)}
              className="viewer-zoom-out viewer-large"
              data-viewer-action="zoom-out"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "one-to-one")}
              onContextMenu={(e) => handleClick(e, "one-to-one", true)}
              className="viewer-one-to-one viewer-large"
              data-viewer-action="one-to-one"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "reset")}
              onContextMenu={(e) => handleClick(e, "reset", true)}
              className="viewer-reset viewer-large"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "rotate-left")}
              onContextMenu={(e) => handleClick(e, "rotate-left", true)}
              className="viewer-rotate-left viewer-large"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "rotate-right")}
              onContextMenu={(e) => handleClick(e, "rotate-right", true)}
              className="viewer-rotate-right viewer-large"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "flip-horizontal")}
              onContextMenu={(e) => handleClick(e, "flip-horizontal", true)}
              className="viewer-flip-horizontal viewer-large"
              data-viewer-action="flip-horizontal"
            />
            <li
              role="button"
              onClick={(e) => handleClick(e, "flip-vertical")}
              onContextMenu={(e) => handleClick(e, "flip-vertical", true)}
              className="viewer-flip-vertical viewer-large"
              data-viewer-action="flip-vertical"
            />
          </ul>
        </div>
      </div>
    </div>
  );
});

export default Toolbar;
