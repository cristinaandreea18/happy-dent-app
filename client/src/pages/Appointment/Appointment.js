import './Appointment.css';
import React, { useState, useEffect, useContext } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import PatientSidebar from '../../components/PatientSidebar/PatientSidebar';
import Avatar from '../../components/Avatar/Avatar';
import SpecialtyCard from '../../components/SpecialtyCard/SpecialtyCard';
import MessageBox from '../../components/MessageBox/MessageBox';
import specialties from '../../utils/specialties';
import { FaCalendar, FaClock } from 'react-icons/fa';

const Appointment = () => {
  const {
    user,
    appointment,
    doctor,
    admin,
    profile,
    availableSlots,
    specialization,
    competency,
    holiday,
  } = useContext(AppContext);
  const [allDoctors, setAllDoctors] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const role = user?.data?.role;

  const patientId = user?.data?.id;
  const hours = doctor?.data?.workingHours;
  const userEmail = user?.data?.email;

  useEffect(() => {
    const loadHolidays = async () => {
      const currentYear = new Date().getFullYear();
      const data = await holiday.getHolidaysByYear(currentYear);
      setHolidays(data.map((h) => h.start)); // doar datele, formatate ca string "YYYY-MM-DD"
    };

    loadHolidays();
  }, []);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await specialization.getSpecializations();
        console.log('Specializations:', response);
        setSpecializations(response);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea specializărilor',
        });
      }
    };

    fetchSpecializations();
  }, []);

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const response = await competency.getCompetencies();
        console.log('Competencies:', response);
        setCompetencies(response);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea competențelor!',
        });
      }
    };

    fetchCompetencies();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await profile.getUserProfile(patientId);
      setPatientProfile(userProfile);
      console.log('Patient Profile:', userProfile);
    };

    const fetchDoctors = async () => {
      try {
        const doctorsList = await admin.getDoctorsList();
        setDoctors(doctorsList);
        setAllDoctors(doctorsList);
      } catch (err) {
        setMessage({ type: 'error', message: 'Failed to load doctors' });
      }
    };
    fetchProfile();
    fetchDoctors();
  }, [patientId]);

  const handleDoctorSelect = (event) => {
    const doctorId = event.target.value;
    const doc = doctors.find((d) => d.doctorId === doctorId);
    setSelectedDoctor(doc);
  };

  const SpecialtiesGrid = ({ onSpecialtyClick, selectedSpecialty }) => {
    return (
      <div className="specialties-grid">
        {specialties.map((specialty) => (
          <SpecialtyCard
            key={specialty.name}
            name={specialty.name}
            img={specialty.img}
            description={specialty.description}
            onClick={onSpecialtyClick}
            isSelected={selectedSpecialty === specialty.name}
          />
        ))}
      </div>
    );
  };

  const filterDoctorsBySpecialty = (clickedSpecialty) => {
    const match = specializations.filter((s) =>
      s.specialties.includes(clickedSpecialty)
    );

    if (!match) return [];

    const specializationName = match.map((s) => s.name);

    return allDoctors.filter((doc) => {
      const hasMatchingSpecialization = doc.specializations.some((spec) =>
        specializationName.includes(spec)
      );
      const hasMatchingCompetency = doc.competencies.some(
        (comp) => comp === clickedSpecialty
      );
      return hasMatchingSpecialization || hasMatchingCompetency;
    });
  };

  const handleSpecialtyClick = (clickedSpecialty) => {
    setSelectedSpecialty(clickedSpecialty);
    const filteredDoctors = filterDoctorsBySpecialty(clickedSpecialty);
    setDoctors(filteredDoctors);
  };

  const isDateValid = (selectedDate, doctor) => {
    if (!doctor?.workingHours) return false;

    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const workingDay = doctor.workingHours[dayName];

    return workingDay?.enabled;
  };

  const isTimeValid = (selectedTime, selectedDate, doctor) => {
    if (!doctor?.workingHours || !selectedDate) return false;

    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const workingHours = doctor.workingHours[dayName];

    if (!workingHours?.enabled) return false;

    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const selectedTimeInMinutes = selectedHour * 60 + selectedMinute;

    return (
      selectedTimeInMinutes >= startTime && selectedTimeInMinutes <= endTime
    );
  };

  const isFutureDate = (selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(selectedDate) >= today;
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setMessage({
        type: 'error',
        message: 'Te rugăm să selectezi data și ora!',
      });
      return;
    }

    if (!isFutureDate(selectedDate)) {
      setMessage({ type: 'error', message: 'Selectează o dată din viitor!.' });
      return;
    }

    if (isHoliday(selectedDate)) {
      setMessage({
        type: 'error',
        message:
          'Ziua selectată este o sărbătoare legală! Te rugăm să alegi altă zi.',
      });
      return;
    }

    if (!isDateValid(selectedDate, selectedDoctor)) {
      setMessage({
        type: 'warning',
        message: 'Doctorul nu este disponibil în ziua selectată!',
      });
      return;
    }

    if (!isTimeValid(selectedTime, selectedDate, selectedDoctor)) {
      setMessage({
        type: 'warning',
        message: 'Ora selectată este în afara orelor de lucru!',
      });
      return;
    }

    try {
      const bookingAppointment = await appointment.bookAppointment({
        patientId,
        doctorId: selectedDoctor.doctorId,
        appointmentDate: selectedDate,
        time: selectedTime,
        reason,
        note,
      });
      if (!bookingAppointment) {
        setMessage({
          type: 'error',
          message: 'Eroare la crearea programării!',
        });
      } else {
        const currentSlotsData = await availableSlots.getAvailableSlots(
          selectedDoctor.doctorId,
          selectedDate
        );

        const updatedSlots = currentSlotsData.slots.filter(
          (slot) => slot !== selectedTime
        );

        await availableSlots.updateAvailableSlots(
          selectedDoctor.doctorId,
          selectedDate,
          updatedSlots
        );
        setMessage({
          type: 'success',
          message: 'Programarea ta a fost înregistrată cu succes!',
        });
      }
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      setNote('');
      setSelectedDoctor(null);
      setSelectedSpecialty(null);
      setDoctors(allDoctors);
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  const isHoliday = (dateStr) => {
    return holidays.includes(dateStr);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    if (isHoliday(date)) {
      setMessage({
        type: 'warning',
        message: 'Nu se pot face programări în zilele de sărbătoare legală!',
      });
      setSelectedDate('');
      return;
    }

    if (selectedDoctor && date) {
      if (!isFutureDate(date)) {
        setMessage({
          type: 'warning',
          message: 'Te rog să selectezi o dată viitoare!',
        });
      } else if (!isDateValid(date, selectedDoctor)) {
        setMessage({
          type: 'warning',
          message: 'Doctorul nu este disponibil în ziua selectată!',
        });
        setSelectedDate('');
      } else {
        setMessage('');
      }
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);

    if (selectedDoctor && time && selectedDate) {
      if (!isTimeValid(time, selectedDate, selectedDoctor)) {
        setMessage({
          type: 'warning',
          message: 'Ora selectată este în afara orelor de lucru!',
        });
        setSelectedTime('');
      } else {
        setMessage('');
      }
    }
  };

  let fullName = '';
  if (role === 'patient') {
    if (patientProfile?.firstName) {
      fullName = `${patientProfile?.firstName} ${patientProfile?.lastName}`;
    } else {
      fullName = 'Pacient nou';
    }
  }

  return (
    <div className="appointment-page-container">
      <PatientSidebar />
      <div className="appointment-main-content">
        <div className="profile-header">
          <h1>
            <FaClock />
            Rezervă o programare
          </h1>{' '}
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

        <h2 className="specialties-title">
          Tipuri de tratamente și îngrijire dentară de calitate
        </h2>
        <SpecialtiesGrid
          onSpecialtyClick={handleSpecialtyClick}
          selectedSpecialty={selectedSpecialty}
        />

        <form className="appointment-form">
          <div className="form-section">
            <div className="form-group">
              <label>
                {selectedSpecialty
                  ? `Alege un doctor pentru ${selectedSpecialty}`
                  : 'Alege un doctor'}
              </label>
              <select
                onChange={handleDoctorSelect}
                value={selectedDoctor?.doctorId || ''}
                className="form-input"
              >
                <option value="">Selectează un doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.firstName} {doc.lastName} {' - '}
                    {'specializări'}: ({doc.specializations.join(', ')}){' '}
                    {doc.competencies?.length > 0
                      ? ` competențe: (${doc.competencies.join(',')})`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div className="doctor-schedule">
                <h3>Ore de lucru:</h3>
                {selectedDoctor.workingHours ? (
                  <ul>
                    {DAYS_OF_WEEK.map((day) => [
                      day,
                      selectedDoctor.workingHours[day],
                    ])
                      .filter(([day, schedule]) => schedule?.enabled)
                      .map(([day, schedule]) => (
                        <li key={day}>
                          <span className="day-name">{day}</span>
                          <span className="hours">
                            {schedule.start} - {schedule.end}
                          </span>{' '}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>Nu există program de lucru disponibil...</p>
                )}
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Selectează data:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Selectează ora:</label>
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="form-input"
                disabled={!selectedDate}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Motivele prezentării:</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descrieți scopul vizitei "
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Informații suplimentare:</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Comentarii opționale"
                className="form-textarea"
              ></textarea>
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
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAppointmentSubmit}
              className="submit-button"
            >
              Trimite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Appointment;
