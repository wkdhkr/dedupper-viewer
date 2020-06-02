import React, { useEffect, useState } from "react";
import { IconButton, Box } from "@material-ui/core";

interface InvisibleButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const InvisibleButton: React.FunctionComponent<InvisibleButtonProps> = ({
  onClick,
  children
}) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <Box
      style={{
        opacity: isHover ? 0.8 : 0,
        transform: "translate(-50%, -50%)",
        transition: "0.3s"
      }}
    >
      <IconButton
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Box>
  );
};

export default InvisibleButton;
