import './DoctorAppointments.css';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button/Button';
import DoctorSidebar from '../../components/DoctorSidebar/DoctorSidebar';
import Avatar from '../../components/Avatar/Avatar';
import StatusPopUp from '../../components/StatusPopup/StatusPopup';
import MessageBox from '../../components/MessageBox/MessageBox';
import {
  FaCalendarAlt,
  FaUserInjured,
  FaClock,
  FaNotesMedical,
  FaEnvelope,
  FaPhone,
  FaEdit,
} from 'react-icons/fa';
import {
  MdPendingActions,
  MdCheckCircle,
  MdCancel,
  MdOutlineHourglassEmpty,
  MdDoneAll,
  MdAccessTime,
} from 'react-icons/md';

const DoctorAppointments = () => {
  const { user, doctor, admin, appointment, socket, availableSlots } =
    useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [buttonPosition, setButtonPosition] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNote, setEditedNote] = useState('');
  const [editingDurationId, setEditingDurationId] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoadingStatusChange, setIsLoadingStatusChange] = useState(false);

  const navigate = useNavigate();
  const doctorId = user?.data?.doctorId;
  const userId = user?.data?.id;
  const role = user?.data?.role;
  console.log('Doctor', doctor);
  console.log('Appointment', appointment);
  console.log('Doctor ID:', doctorId);

  const [isLoading, setIsLoading] = useState(true);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const name = `${appointment.patient?.profile?.firstName || ''} ${
        appointment.patient?.profile?.lastName || ''
      }`.toLowerCase();
      const status = appointment.status?.toLowerCase().replace(' ', '-');
      const date = new Date(appointment.appointmentDate);
      const term = searchTerm.toLowerCase();

      const matchName = name.includes(term);
      const matchMonth = selectedMonth
        ? date.getMonth() + 1 === Number(selectedMonth)
        : true;
      const matchStatusSearch = status.includes(term);
      const matchStatusDropdown = selectedStatus
        ? status === selectedStatus
        : true;

      return (
        (matchName || matchStatusSearch) && matchMonth && matchStatusDropdown
      );
    });
  }, [appointments, searchTerm, selectedMonth, selectedStatus]);

  const handleStatusButtonClick = (appointmentId, status, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setButtonPosition({
      top: buttonRect.top,
      left: buttonRect.left,
      height: buttonRect.height,
      width: buttonRect.width,
    });

    setSelectedAppointment(appointmentId);
    setNewStatus(status);
    setShowPopup(true);
  };

  const getFormattedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const confirmStatusChange = async () => {
    setIsLoadingStatusChange(true);
    try {
      await appointment.updateAppointmentStatus(selectedAppointment, newStatus);
      console.log('Selected app', selectedAppointment);

      if (socket) {
        const appointmentToUpdate = appointments.find(
          (app) => app.appointmentId === selectedAppointment
        );
        console.log('Appointment Structure', appointmentToUpdate);
        console.log('SOCKET: Emitting doctorUpdateAppointment:', {
          patientId: appointmentToUpdate.patientId,
          appointmentId: selectedAppointment,
          newStatus: newStatus,
          doctorName: `${appointmentToUpdate.doctor.firstName} ${appointmentToUpdate.doctor.lastName}`,
          appointmentDate: getFormattedDate(
            appointmentToUpdate.appointmentDate
          ),
          time: appointmentToUpdate.time,
        });
        socket.emit('doctorUpdateAppointment', {
          patientId: appointmentToUpdate.patientId,
          appointmentId: selectedAppointment,
          newStatus: newStatus,
          doctorName: `${appointmentToUpdate.doctor.firstName} ${appointmentToUpdate.doctor.lastName}`,
          appointmentDate: getFormattedDate(
            appointmentToUpdate.appointmentDate
          ),
          time: appointmentToUpdate.time,
        });
      }

      setAppointments(
        appointments.map((app) =>
          app.appointmentId === selectedAppointment
            ? { ...app, status: newStatus }
            : app
        )
      );
      setMessage({
        type: 'success',
        message: 'Statusul programării a fost actualizat cu succes!',
      });
      setShowPopup(false);
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
      setShowPopup(false);
    } finally {
      setIsLoadingStatusChange(false);
    }
  };

  const cancelStatusChange = () => {
    setShowPopup(false);
    setSelectedAppointment(null);
    setNewStatus('');
  };

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

    const fetchAppointments = async () => {
      try {
        const response = await appointment.getAppointmentsByDoctorId(doctorId);
        setAppointments(response.appointments || []);
      } catch (err) {
        setMessage({ type: 'error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    if (userId && doctorId) {
      fetchDoctorProfile();
      fetchAppointments();
    }
  }, [userId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <MdPendingActions className="status-icon pending" />;
      case 'confirmed':
        return <MdCheckCircle className="status-icon confirmed" />;
      case 'cancelled':
        return <MdCancel className="status-icon cancelled" />;
      default:
        return <MdPendingActions className="status-icon" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  const handleEditNote = (appointmentId, currentNote) => {
    setEditingNoteId(appointmentId);
    setEditedNote(currentNote || '');
  };

  const handleSaveNote = async (appointmentId) => {
    try {
      await appointment.updateAppointmentNote(appointmentId, editedNote);

      setAppointments(
        appointments.map((app) =>
          app.appointmentId === appointmentId
            ? { ...app, note: editedNote }
            : app
        )
      );

      setEditingNoteId(null);
      setMessage({
        type: 'success',
        message: 'Notița a fost salvată cu succes!',
      });
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNote('');
  };

  const handleEditDuration = (appointmentId, currentDuration) => {
    setEditingDurationId(appointmentId);
    setSelectedDuration(currentDuration || 30);
  };

  const generateOccupiedSlots = (startTime, duration) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const slotDuration = 30;
    const slotsCount = duration / slotDuration;

    const occupied = [];

    for (let i = 0; i < slotsCount; i++) {
      const minutes = startHour * 60 + startMinute + i * slotDuration;
      const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
      const min = String(minutes % 60).padStart(2, '0');
      occupied.push(`${hour}:${min}`);
    }

    return occupied;
  };

  const handleSaveDuration = async (appointmentId) => {
    try {
      const currentAppointment = appointments.find(
        (a) => a.appointmentId === appointmentId
      );
      const oldDuration = currentAppointment.duration || 30;

      await appointment.updateAppointmentDuration(
        appointmentId,
        selectedDuration
      );

      const date = currentAppointment.appointmentDate;
      const time = currentAppointment.time;

      const currentSlotsData = await availableSlots.getAvailableSlots(
        doctorId,
        date
      );
      const availableSlotsForDay = currentSlotsData.slots || [];

      const previouslyOccupied = generateOccupiedSlots(time, oldDuration);
      const nowOccupied = generateOccupiedSlots(time, selectedDuration);

      const freedSlots = previouslyOccupied.filter(
        (slot) => !nowOccupied.includes(slot)
      );

      const updatedSlots = Array.from(
        new Set([...availableSlotsForDay, ...freedSlots])
      )
        .filter((slot) => !nowOccupied.includes(slot))
        .sort();

      await availableSlots.updateAvailableSlots(doctorId, date, updatedSlots);

      setAppointments(
        appointments.map((app) =>
          app.appointmentId === appointmentId
            ? { ...app, duration: selectedDuration }
            : app
        )
      );

      setEditingDurationId(null);
      setMessage({
        type: 'success',
        message: 'Durata actualizată și slotul ajustat!',
      });
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  const durationOptions = [30, 60, 90, 120];

  let fullName = '';
  if (role === 'doctor') {
    if (doctorProfile?.firstName) {
      fullName = `${doctorProfile?.firstName} ${doctorProfile?.lastName}`;
    } else {
      fullName = 'Doctor nou';
    }
  }

  return (
    <div className="doctor-appointments-container">
      <DoctorSidebar />
      <StatusPopUp
        isOpen={showPopup}
        onCancel={cancelStatusChange}
        onConfirm={confirmStatusChange}
        title="Confirmă schimbarea statusului"
        message={`Ești sigur că vrei să modifici statusul programării în ${newStatus}?`}
        position={buttonPosition}
        status={newStatus.toLowerCase()}
        isLoading={isLoadingStatusChange}
      />

      <div className="doctor-appointments-content">
        <div className="profile-header">
          <h1>
            <FaCalendarAlt /> Vizite programate
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

        <div className="filters-bar">
          <div className="search-wrapper">
            {/* <label htmlFor="search-input">Cautare pacient</label> */}
            <i className="bx bx-search"></i>
            <input
              id="search-input"
              type="text"
              placeholder="Caută pacient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="custom-select-wrapper">
            {/* <label htmlFor="month-select">Filtrare după lună</label> */}
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              <option value="">Toate lunile</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('ro-RO', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="custom-select-wrapper">
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Toate statusurile</option>
              <option value="in-asteptare">In asteptare</option>
              <option value="confirmata">Confirmata</option>
              <option value="anulata">Anulata</option>
              <option value="finalizata">Finalizata</option>
            </select>
          </div>
          <Button
            variant="danger"
            size="small"
            onClick={() => {
              setSearchTerm('');
              setSelectedMonth('');
              setSelectedStatus('');
            }}
          >
            Resetează filtrele
          </Button>
        </div>

        {appointments.length === 0 ? (
          <div className="no-appointments">
            <p>Nicio vizită programată deocamdată...</p>
          </div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.appointmentId} className="appointment-card">
                <div
                  className={`appointment-header status-${appointment.status
                    .toLowerCase()
                    .replace(' ', '-')}`}
                >
                  {/* <div className="appointment-header"> */}
                  <div className="status-badge">
                    {getStatusIcon(appointment.status)}
                    <span className="status-text">{appointment.status}</span>
                  </div>
                  <div className="appointment-date">
                    <FaClock className="info-icon" />
                    <span>
                      {formatDate(appointment.appointmentDate)} la{' '}
                      {appointment.time}
                    </span>
                  </div>
                </div>

                <div className="appointment-body">
                  <div className="patient-general-info">
                    <FaUserInjured className="info-icon" />
                    <span>
                      {appointment.patient?.profile?.firstName}{' '}
                      {appointment.patient?.profile?.lastName}
                    </span>

                    <span className="patient-contact-item">
                      <p>Informații de contact</p>
                      <div className="contact-info-row">
                        <span className="contact-icon-with-text">
                          <FaEnvelope className="contact-icon" />
                          <span>{appointment.patient?.email || 'N/A'}</span>
                          <FaPhone className="contact-icon" />
                          <span>
                            {appointment.patient?.profile?.phoneNumber || 'N/A'}
                          </span>
                        </span>
                      </div>
                    </span>
                  </div>

                  {appointment.reason && (
                    <div className="appointment-reason">
                      <FaNotesMedical className="info-icon" />
                      <span>{appointment.reason}</span>
                    </div>
                  )}

                  <div className="appointment-note">
                    <FaNotesMedical className="info-icon" />
                    {editingNoteId === appointment.appointmentId ? (
                      <div className="note-edit-container">
                        <textarea
                          value={editedNote}
                          onChange={(e) => setEditedNote(e.target.value)}
                          placeholder="Adaugă notițe..."
                          className="note-textarea"
                        />
                        <div className="note-edit-buttons">
                          <Button
                            variant="cancelled"
                            size="small"
                            onClick={handleCancelEdit}
                          >
                            Anulează
                          </Button>
                          <Button
                            variant="completed"
                            size="small"
                            onClick={() =>
                              handleSaveNote(appointment.appointmentId)
                            }
                          >
                            Salvează
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="note-display-container">
                        <span>{appointment.note || 'Nu există notițe'}</span>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() =>
                            handleEditNote(
                              appointment.appointmentId,
                              appointment.note
                            )
                          }
                          className="edit-note-button"
                        >
                          <FaEdit className="info-icon" />
                          Editează
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="appointment-duration">
                    <MdAccessTime className="info-icon" />
                    {editingDurationId === appointment.appointmentId ? (
                      <div className="duration-edit-container">
                        <div className="duration-options">
                          {durationOptions.map((minutes) => (
                            <button
                              key={minutes}
                              className={`duration-option ${
                                selectedDuration === minutes ? 'selected' : ''
                              }`}
                              onClick={() => setSelectedDuration(minutes)}
                            >
                              {minutes} min
                            </button>
                          ))}
                        </div>
                        <div className="duration-action-buttons">
                          <Button
                            variant="cancelled"
                            size="small"
                            onClick={() => setEditingDurationId(null)}
                          >
                            Anulează
                          </Button>
                          <Button
                            variant="completed"
                            size="small"
                            onClick={() =>
                              handleSaveDuration(appointment.appointmentId)
                            }
                          >
                            Salvează
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="duration-display-container">
                        <span>
                          Durată: {appointment.duration || 'Not set'} minute
                        </span>
                        <Button
                          size="small"
                          type="button"
                          variant="primary"
                          onClick={() =>
                            handleEditDuration(
                              appointment.appointmentId,
                              appointment.duration
                            )
                          }
                          className="edit-duration-button"
                        >
                          <FaEdit className="info-icon" />
                          Editează
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="appointment-actions">
                  <div className="status-buttons">
                    <Button
                      variant="pending"
                      size="medium"
                      className={
                        appointment.status === 'In asteptare' ? 'active' : ''
                      }
                      onClick={(e) =>
                        handleStatusButtonClick(
                          appointment.appointmentId,
                          'In asteptare',
                          e
                        )
                      }
                    >
                      <MdOutlineHourglassEmpty />
                      In asteptare
                    </Button>

                    <Button
                      variant="confirmed"
                      size="medium"
                      className={
                        appointment.status === 'Confirmata' ? 'active' : ''
                      }
                      onClick={(e) =>
                        handleStatusButtonClick(
                          appointment.appointmentId,
                          'Confirmata',
                          e
                        )
                      }
                    >
                      <MdCheckCircle />
                      Confirmata
                    </Button>

                    <Button
                      variant="cancelled"
                      size="medium"
                      className={
                        appointment.status === 'Anulata' ? 'active' : ''
                      }
                      onClick={(e) =>
                        handleStatusButtonClick(
                          appointment.appointmentId,
                          'Anulata',
                          e
                        )
                      }
                    >
                      <MdCancel />
                      Anulata
                    </Button>

                    <Button
                      variant="completed"
                      size="medium"
                      className={
                        appointment.status === 'Finalizata' ? 'active' : ''
                      }
                      onClick={(e) =>
                        handleStatusButtonClick(
                          appointment.appointmentId,
                          'Finalizata',
                          e
                        )
                      }
                    >
                      <MdDoneAll />
                      Finalizata
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {searchTerm.trim() && filteredAppointments.length === 0 && (
              <div className="no-results">
                <p>Nu au fost găsite programări pentru "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}
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

export default DoctorAppointments;
