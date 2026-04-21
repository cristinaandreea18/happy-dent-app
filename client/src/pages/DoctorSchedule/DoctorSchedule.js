import './DoctorSchedule.css';
import { useContext, useState, useEffect } from 'react';
import AppContext from '../../state/AppContext';
import WeeklyCalendar from '../../components/WeeklyCalendar/WeeklyCalendar';
import DoctorSidebar from '../../components/DoctorSidebar/DoctorSidebar';
import Avatar from '../../components/Avatar/Avatar';
import { FaCalendarAlt } from 'react-icons/fa';

const DoctorSchedule = () => {
  const { user, doctor } = useContext(AppContext);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [message, setMessage] = useState(null);

  const doctorId = user?.data?.doctorId;
  const userId = user?.data?.id;
  const role = user?.data?.role;

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const doctorProfileData = await doctor.getDoctorProfile(userId);
        setDoctorProfile(doctorProfileData);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea profilului doctorului!',
        });
      }
    };

    fetchDoctorProfile();
  }, [userId]);

  let fullName = '';
  if (role === 'doctor') {
    if (doctorProfile?.firstName) {
      fullName = `${doctorProfile?.firstName} ${doctorProfile?.lastName}`;
    } else {
      fullName = 'Doctor nou';
    }
  }

  return (
    <div className="doctor-schedule-container">
      <DoctorSidebar />

      <div className="doctor-schedule-content">
        <div className="profile-header">
          <h1>
            <FaCalendarAlt />
            Calendar
          </h1>
          <div className="doctor-info">
            <Avatar
              image={
                user?.data?.profilePicURL ||
                'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
              }
              name={fullName}
              role={user?.data?.role}
              superRole={doctor?.data?.specialization}
              email={user?.data?.email}
            />
          </div>
        </div>

        <WeeklyCalendar doctorId={doctorId} />
      </div>
    </div>
  );
};

export default DoctorSchedule;
