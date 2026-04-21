import './MessageBox.css';
import { React, useState, useEffect } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const iconMap = {
  info: <Info size={30} />,
  warning: <AlertTriangle size={30} />,
  error: <AlertCircle size={30} />,
  success: <CheckCircle size={30} />,
};

const MessageBox = ({ type, message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div className={`message-box ${type} ${isExiting ? 'fade-out' : ''}`}>
      <span className="icon">{iconMap[type]}</span>
      <div className="content">
        <strong className="title">{type.toUpperCase()}!</strong>
        <div className="message">{message}</div>
      </div>
    </div>
  );
};

export default MessageBox;
