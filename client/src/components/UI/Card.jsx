import React from "react";
import "./UI.css";

const Card = ({
  title,
  subtitle,
  headerActions,
  footer,
  children,
  hoverable = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`ui-card ${hoverable ? "card-hoverable" : ""} ${className}`} {...props}>
      {(title || subtitle || headerActions) && (
        <div className="card-header">
          <div className="card-header-titles">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerActions && <div className="card-header-actions">{headerActions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;