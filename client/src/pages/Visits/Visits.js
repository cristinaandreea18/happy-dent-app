import './Visits.css';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/PatientSidebar/PatientSidebar';
import Avatar from '../../components/Avatar/Avatar';
import AppContext from '../../state/AppContext';
import MessageBox from '../../components/MessageBox/MessageBox';
import { FaRobot } from 'react-icons/fa';
import { TbCalendarClock } from 'react-icons/tb';

const Visits = () => {
  const { user, profile, appointment } = useContext(AppContext);
  const [patientProfile, setPatientProfile] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  // const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const role = user?.data?.role;
  const userEmail = user?.data?.email;
  const patientId = user?.data?.id;

  console.log('APPOINTMENTS', appointment);
  console.log('user', patientId);

  useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await profile.getUserProfile(patientId);
      setPatientProfile(userProfile);
      console.log('Patient Profile:', userProfile);
    };

    const fetchPatientAppointments = async () => {
      try {
        const response =
          await appointment.getAllAppointmentsForPatient(patientId);
        setIsLoadingAppointments(true);
        const appointments = response.appointments || [];
        setPatientAppointments(appointments);

        const now = new Date();
        const upcoming = [];
        const past = [];

        appointments.forEach((appt) => {
          const apptDate = new Date(`${appt.appointmentDate}T${appt.time}`);
          if (apptDate >= now && appt.status !== 'Cancelled') {
            upcoming.push(appt);
          } else {
            past.push(appt);
          }
        });

        upcoming.sort(
          (a, b) =>
            new Date(`${a.appointmentDate}T${a.time}`) -
            new Date(`${b.appointmentDate}T${b.time}`)
        );
        past.sort(
          (a, b) =>
            new Date(`${b.appointmentDate}T${b.time}`) -
            new Date(`${a.appointmentDate}T${a.time}`)
        );

        setUpcomingVisits(upcoming);
        setPastVisits(past);
      } catch (err) {
        setMessage({
          type: 'error',
          message: err.message,
        });
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    if (patientId) {
      fetchProfile();
      fetchPatientAppointments();
    }
  }, [patientId]);

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return [weekday, month, day.toString(), year.toString()];
  };

  const openChatbot = () => {
    navigate('/chatbot');
  };

  let fullName = '';
  if (role === 'patient') {
    if (patientProfile?.firstName) {
      fullName = `${patientProfile?.firstName} ${patientProfile?.lastName}`;
    } else {
      fullName = 'Patient nou';
    }
  }
  console.log('doctor', profile?.data);

  return (
    <div className="visits-page-container">
      <PatientSidebar />
      <div className="visits-main-content">
        <div className="profile-header">
          <h1>
            <TbCalendarClock />
            Programări și Vizite
          </h1>
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

        <div className="appointments-container">
          <button
            className="chatbot-button"
            onClick={openChatbot}
            title="Open Recheduling Assistant"
          >
            <FaRobot className="chatbot-icon" />
            <span> Asistentul HappyDent</span>
          </button>

          <section className="visits-section">
            <h2 className="visit-section-title">Programări viitoare</h2>
            {isLoadingAppointments ? (
              <p className="loading-message">Încărcare programări...</p>
            ) : upcomingVisits.length > 0 ? (
              <div className="appointments-grid">
                {upcomingVisits.map((appt) => {
                  const [weekday, month, day, year] = formatDateDisplay(
                    appt.appointmentDate
                  );
                  console.log('appt', appt);
                  return (
                    <div
                      key={appt.appointmentId}
                      className="visit-card upcoming"
                    >
                      <div className="date-display">
                        <div className="month">{month}</div>
                        <div className="day">{day}</div>
                        <div className="year">{year}</div>
                      </div>
                      <div className="appointment-details">
                        <div className="time-status">
                          <span className="time">{appt.time}</span>
                          <span
                            className={`status ${appt.status
                              .toLowerCase()
                              .replace(' ', '-')}`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <div className="doctor-info-visit">
                          <h3>
                            Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                          </h3>
                          <p className="specialty">
                            {appt.doctor?.specializations
                              ?.map((s) => s.name)
                              .join(', ') || 'Practică generală'}
                          </p>
                        </div>
                        <div className="reason">
                          <p>{appt.reason || 'Fără motiv specificat'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-appointments">
                Nu există programări viitoare...
              </p>
            )}
          </section>

          <section className="visits-section">
            <h2 className="visit-section-title">Programări trecute</h2>
            {pastVisits.length > 0 ? (
              <div className="appointments-grid">
                {pastVisits.map((appt) => {
                  const [weekday, month, day, year] = formatDateDisplay(
                    appt.appointmentDate
                  );
                  return (
                    <div key={appt.appointmentId} className="visit-card past">
                      <div className="date-display">
                        <div className="month">{month}</div>
                        <div className="day">{day}</div>
                        <div className="year">{year}</div>
                      </div>
                      <div className="appointment-details">
                        <div className="time-status">
                          <span className="time">{appt.time}</span>
                          <span
                            className={`status ${appt.status.toLowerCase()}`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <div className="doctor-info-visit">
                          <h3>
                            Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                          </h3>
                          <p className="specialty">
                            {appt.doctor?.specializations
                              ?.map((s) => s.name)
                              .join(', ') || 'Practică generală'}
                          </p>
                        </div>
                        <div className="reason">
                          <p>{appt.reason || 'Fără motiv specificat'}</p>
                        </div>
                        {appt.note && (
                          <div className="doctor-notes">
                            <h4>Notițe doctor:</h4>
                            <p>{appt.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-appointments">Nu există programări trecute...</p>
            )}
          </section>
        </div>
      </div>

      {message && (
        <MessageBox
          type={message.type}
          message={message.message}
          duration={1000}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
};

export default Visits;
