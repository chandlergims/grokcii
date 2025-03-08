import React from "react";
import "../styles/buttons.css";

export interface ButtonProps {
  text: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link" | "gold";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  text, 
  icon, 
  variant = "primary", 
  onClick, 
  className = "",
  type = "button",
  iconPosition = "right",
  size,
  disabled = false,
  loading = false
}) => {
  const sizeClass = size ? `btn-${size}` : "";
  const hasIcon = icon ? "btn-icon" : "";
  const isDisabled = disabled || loading;
  const loadingClass = loading ? "btn-loading" : "";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`btn btn-${variant} ${sizeClass} ${hasIcon} ${loadingClass} ${className}`}
    >
      {loading ? (
        <span className="loading-spinner"></span>
      ) : (
        <>
          {iconPosition === "left" && icon && <span className="icon">{icon}</span>}
          <span>{text}</span>
          {iconPosition === "right" && icon && <span className="icon">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
