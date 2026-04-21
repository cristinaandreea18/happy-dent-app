import './SpecialtyCard.css';
import Button from '../Button/Button';
import React, { useState } from 'react';

const SpecialtyCard = ({ name, img, description, onClick, isSelected }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation(); 
    setShowDescription((prev) => !prev);
  };

  const handleCardClick = () => {
    if (onClick) onClick(name);
  }
  return (
    <div
      className={`specialty-card ${showDescription ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      <img src={img} alt={name} className="specialty-img" />
      <span className="specialty-name">{name}</span>
      {showDescription && (
        <p className="specialty-description">{description}</p>
      )}{' '}
      <Button
        type="primary"
        className="specialty-button"
        onClick={handleToggle}
      >
        {showDescription ? 'Ascunde' : 'Detalii'}
      </Button>
    </div>
  );
};

export default SpecialtyCard;
