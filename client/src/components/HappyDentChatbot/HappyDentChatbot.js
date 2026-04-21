import './HappyDentChatbot.css';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from 'react-chatbot-kit';
import AppContext from '../../state/AppContext';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import { FaTimes } from 'react-icons/fa';
import config from './config';

const HappyDentChatbot = () => {
  const { user, appointment, availableSlots } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const chatbotRef = useRef(null);
  console.log('Appointment data:', appointment);
  console.log('Available slots', availableSlots);
  const patientId = user?.data?.id;

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      try {
        const response =
          await appointment.getAllAppointmentsForPatient(patientId);
        const appointments = response.appointments || [];

        if (appointments) {
          config.state = {
            ...config.state,
            appointments: appointments,
            currentAppointment: null,
            availableSlots: availableSlots,
            appointmentStore: appointment,
          };

          console.log('Config.state actualizat:', config.state);
          setLoading(false);
        }
      } catch (err) {
        setMessage({
          type: 'error',
          message: err.message,
        });
        setLoading(false);
      }
    };

    fetchPatientAppointments();
  }, [appointment]);

  return (
    <div className="happy-dent-chatbot-container">
      <div className="chatbot-header">
        <h3>HappyDent - Asistență rapidă</h3>
        <button className="close-chatbot" onClick={() => navigate('/visits')}>
          <FaTimes />
        </button>
      </div>
      <div className="chatbot-content">
        {loading ? (
          <div>Se încarcă asistentul...</div>
        ) : (
          <ChatBot
            ref={chatbotRef}
            config={{
              ...config,
              customComponents: {
                ...config.customComponents,
                userAvatar: () => (
                  <div className="react-chatbot-kit-user-avatar">
                    <img
                      src={
                        user?.data?.profilePicURL ||
                        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                      }
                      alt="User"
                    />
                  </div>
                ),
              },
            }}
            actionProvider={ActionProvider}
            messageParser={MessageParser}
          />
        )}
      </div>
    </div>
  );
};

export default HappyDentChatbot;
