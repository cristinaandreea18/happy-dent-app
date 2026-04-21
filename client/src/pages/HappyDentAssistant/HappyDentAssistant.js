import './HappyDentAssistant.css';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/PatientSidebar/PatientSidebar';
import Avatar from '../../components/Avatar/Avatar';
import AppContext from '../../state/AppContext';

const HappyDentAssistant = () => {
  const { user, profile } = useContext(AppContext);
  const role = user?.data?.role;
  const userEmail = user?.data?.email;
  const navigate = useNavigate();

  const fullName = `${profile?.data?.firstName} ${profile?.data?.lastName}`;

  useEffect(() => {
    navigate('/chatbot');
  }, [navigate]);

  return (
    <div className="assistant-page-container">
      <PatientSidebar />
      <div className="assistant-main-content">
        <div className="profile-header">
          <h1>Rezervări și Istoricul programărilor</h1>
          <div className="user-info">
            <Avatar
              image={
                user?.data?.profilePicURL ||
                'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
              }
              name={fullName || 'Pacient nou'}
              role={role}
              email={userEmail}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HappyDentAssistant;
