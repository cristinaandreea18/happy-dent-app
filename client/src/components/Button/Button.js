import './Button.css';
import React from 'react';

const Button = ({
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} 
    ${disabled ? 'disabled' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
