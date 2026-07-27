import React from "react";
import "./UI.css";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  icon,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`ui-input-group ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label className="ui-label" htmlFor={name}>
          {label} {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      <div className="input-inner-wrapper">
        {icon && <span className="input-icon-wrapper">{icon}</span>}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`ui-input ${icon ? "with-icon" : ""}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;