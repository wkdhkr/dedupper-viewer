import React from "react";
import { Slide } from "@material-ui/core";

const SlideUp = React.forwardRef(function Transition(props: any, ref) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />;
});

export default SlideUp;
