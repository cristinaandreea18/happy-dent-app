import './Popup.css';
import React from 'react';
import Button from '../Button/Button';

const Popup = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  position,
  children,
}) => {
  if (!isOpen) return null;

  const style = position
    ? {
        position: 'relative',
        top: `${position.top + position.height}px`,
        left: `${position.left}px`,
        transform: `translateX(130%)`,
      }
    : {};

  return (
    <div className="popup-overlay">
      <div
        className="popup-container"
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <div className="dropdown-divider"></div>
        {children || <p>{message}</p>}
        <div className="popup-buttons">
          <Button
            type="button"
            variant="primary"
            onClick={onCancel}
            className="popup-btn-cancel"
          >
            Anulează
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            className="popup-btn-confirm"
          >
            Confirmă
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
