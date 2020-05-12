import React from "react";
import { MultiImageViewer } from "../components/viewer";
import { MainViewerState } from "../types/unistore";

type MainViewerProps = MainViewerState;

const MainViewer: React.SFC<MainViewerProps> = ({ images }) => {
  return <MultiImageViewer images={images} />;
  // return <div />;
};
export default MainViewer;
