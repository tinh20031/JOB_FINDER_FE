import React from "react";
import "./ClickableBox.css";

const ClickableBox = ({
  onClick,
  children,
  className = "",
  style = {},
  ...props
}) => (
  <div
    className={`job-block job-block-hover ${className}`}
    style={{ cursor: "pointer", ...style }}
    onClick={onClick}
    {...props}
  >
    <div className="inner-box">{children}</div>
  </div>
);

export default ClickableBox; 