import './StatusPopup.css';
import React from 'react';
import { Dots } from 'react-activity';
import 'react-activity/dist/library.css';
import Button from '../Button/Button';

const StatusPopUp = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  position,
  status,
  isLoading,
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

  const newMessage = message.replace(/\s*\w+[?]?$/, '');
  console.log('Message', newMessage);

  return (
    <div className="status-popup-overlay">
      <div
        className="status-popup-container"
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <div className="dropdown-divider"></div>
        <p>
          {newMessage} {''}
          <span className={`status-text status-${status.toLowerCase()}`}>
            {status}
          </span>
          {'?'}
        </p>
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
            disabled={isLoading}
          >
            {isLoading ? <Dots color="#fff" size={20} /> : 'Confirmă'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusPopUp;
