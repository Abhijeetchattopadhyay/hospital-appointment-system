import React from "react";
import "./UI.css"; // We will add general UI styles to a single CSS file or write inline styles. Let's make it styled professionally with classes.

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`ui-btn btn-${variant} btn-${size} ${isLoading ? "btn-loading" : ""} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <span className="btn-spinner"></span>}
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default Button;