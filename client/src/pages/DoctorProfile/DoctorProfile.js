import './DoctorProfile.css';
import { useState, useContext, useEffect } from 'react';

import AppContext from '../../state/AppContext';
import DoctorSidebar from '../../components/DoctorSidebar/DoctorSidebar';
import Avatar from '../../components/Avatar/Avatar';
import MessageBox from '../../components/MessageBox/MessageBox';

const DoctorProfile = () => {
  const { doctor, user, admin } = useContext(AppContext);
  const [doctorData, setDoctorData] = useState(null);
  const [message, setMessage] = useState(null);

  const userId = user?.data?.id;
  const doctorId = user?.data?.doctorId;
  const role = user?.data?.role;
  console.log('Doctor Id', doctorId);

  const zileInOrdineaSaptamanii = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const data = await admin.getDoctorById(doctorId);
        setDoctorData(data);
        console.log('Doctor Data:', data);
      } catch (error) {
        setMessage({ type: 'error', message: error.message });
      }
    };

    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  let fullName = '';
  if (role === 'doctor') {
    if (doctorData?.firstName) {
      fullName = `${doctorData?.firstName} ${doctorData?.lastName}`;
    } else {
      fullName = 'Doctor nou';
    }
  }

  return (
    <div className="doctor-profile-page">
      <DoctorSidebar />
      <div className="doctor-profile-container">
        <div className="profile-header">
          <h1>Bine ai revenit, {fullName}!</h1>
          <div className="doctor-actions">
            <Avatar
              image={
                user?.data?.profilePicURL ||
                'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
              }
              name={fullName}
              role="doctor"
              superRole={''}
              email={user?.data?.email}
            />
          </div>
        </div>

        <div className="dashboard-content">
          <div className="right-column">
            <div className="doctor-profile-details">
              <div className="details-container">
                <div className="profile-header-centered">
                  <img
                    src={
                      user?.data?.profilePicURL ||
                      'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                    }
                    alt={fullName}
                  />
                  <h2>{fullName}</h2>
                  <p className="profile-subtitle">Profil doctor</p>
                </div>

                <div className="details-grid">
                  <div className="detail-section">
                    <h3>Informații profesionale</h3>
                    <p>
                      <strong>Specializări:</strong>{' '}
                      {doctorData?.specializations?.join(', ') ||
                        'Nu sunt specificate'}
                    </p>
                    <p>
                      <strong>Competențe:</strong>{' '}
                      {doctorData?.competencies?.join(', ') ||
                        'Nu sunt specificate'}
                    </p>
                  </div>

                  <div className="detail-section">
                    <h3>Contact</h3>
                    <p>
                      <strong>Email:</strong> {doctorData?.user?.email || 'N/A'}
                    </p>
                    <p>
                      <strong>Telefon:</strong> {doctorData?.phone || 'N/A'}
                    </p>
                  </div>

                  <div className="detail-section">
                    <h3>Program de lucru</h3>
                    {doctorData?.workingHours &&
                      Object.entries(doctorData.workingHours)
                        .sort(([dayA], [dayB]) => {
                          return (
                            zileInOrdineaSaptamanii.indexOf(dayA) -
                            zileInOrdineaSaptamanii.indexOf(dayB)
                          );
                        })
                        .map(([day, hours]) => (
                          <p key={day}>
                            <strong>{day}:</strong>{' '}
                            {hours.enabled
                              ? `${hours.start} - ${hours.end}`
                              : 'Liber'}
                          </p>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <MessageBox
            type={message.type}
            message={message.message}
            duration={3000}
            onClose={() => setMessage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
