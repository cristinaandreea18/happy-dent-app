import './PatientProfile.css';
import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import DoctorSidebar from '../../components/DoctorSidebar/DoctorSidebar';

const PatientProfile = () => {
  const { doctor } = useContext(AppContext);
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const patientData = await doctor.getPatientById(id);
        setPatient(patientData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPatient();
  }, [id, doctor]);

  if (!patient) return <p>Loading...</p>;

  return (
    <div className="patient-profile-page">
      <DoctorSidebar />
      <div className="profile-container">
        <div className="left-section">
          <div className="profile-card">
            <h2>Informații personale</h2>
            <p>
              <strong>Nume:</strong> {patient.profile.firstName}{' '}
              {patient.profile.lastName}
            </p>
            <p>
              <strong>Data nașterii:</strong> {patient.profile.dateOfBirth}
            </p>
            <p>
              <strong>Gen:</strong> {patient.profile.gender}
            </p>
            <p>
              <strong>Ocupație:</strong> {patient.profile.ocupation}
            </p>
          </div>

          <div className="profile-card contact-info">
            <h2>Informații de contact</h2>
            <p>
              <strong>Email:</strong> {patient.profile.email}
            </p>
            <p>
              <strong>Telefon:</strong> {patient.profile.phoneNumber}
            </p>
          </div>
        </div>

        <div className="right-section">
          <div className="profile-card address-info">
            <h2>Adresă</h2>
            <p>
              <strong>Județ:</strong> {patient.profile.city}
            </p>
            <p>
              <strong>Oraș:</strong> {patient.profile.county}
            </p>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};
export default PatientProfile;
