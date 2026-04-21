import './AdminDashboard.css';
import React, { useState, useEffect, useContext } from 'react';
import AppContext from '../../state/AppContext';
import Avatar from '../../components/Avatar/Avatar';
import {
  FaUserMd,
  FaStethoscope,
  FaTooth,
  FaEdit,
  FaTrashAlt,
} from 'react-icons/fa';
import validation from '../../utils/validation';
import competencies from '../../utils/competencies';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import Popup from '../../components/Popup/Popup';
import Button from '../../components/Button/Button';
import MessageBox from '../../components/MessageBox/MessageBox';

const AdminDashboard = () => {
  const { admin, user, availableSlots, specialization, competency } =
    useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const DEFAULT_WORKING_HOURS = {
    Monday: { start: '09:00', end: '17:00', enabled: false },
    Tuesday: { start: '09:00', end: '17:00', enabled: false },
    Wednesday: { start: '09:00', end: '17:00', enabled: false },
    Thursday: { start: '09:00', end: '17:00', enabled: false },
    Friday: { start: '09:00', end: '17:00', enabled: false },
    Saturday: { start: '14:00', end: '17:00', enabled: false },
    Sunday: { start: '14:00', end: '17:00', enabled: false },
  };

  const [specializations, setSpecializations] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [message, setMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isdeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [tempDoctorData, setTempDoctorData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specializations: [],
    competencies: [],
    workingHours: { ...DEFAULT_WORKING_HOURS },
  });

  const adminId = user?.data?.id;
  console.log('Admin store', admin);

  useEffect(() => {
    fetchAdminProfile();
    fetchDoctors();
  }, [adminId]);

  const fetchAdminProfile = async () => {
    try {
      const adminProfileData = await admin.getAdminProfile(adminId);
      setAdminProfile(adminProfileData);
    } catch (err) {
      setMessage({
        type: 'error',
        message: 'Eroare la încărcarea pacienților!',
      });
    }
  };

  const fetchDoctors = async () => {
    try {
      const doctorsList = await admin.getDoctorsList();
      const formattedDoctors = doctorsList.map((doctor) => ({
        ...doctor,
        workingHours: doctor.workingHours || {
          Monday: { start: '09:00', end: '17:00', enabled: false },
          Tuesday: { start: '09:00', end: '17:00', enabled: false },
          Wednesday: { start: '09:00', end: '17:00', enabled: false },
          Thursday: { start: '09:00', end: '17:00', enabled: false },
          Friday: { start: '09:00', end: '17:00', enabled: false },
          Saturday: { start: '14:00', end: '17:00', enabled: false },
          Sunday: { start: '14:00', end: '17:00', enabled: false },
        },
      }));
      setDoctors(formattedDoctors);
    } catch (err) {
      setMessage({
        type: 'error',
        message: 'Eroare la încărcarea doctorilor!',
      });
    }
  };

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

  const handleAddSpecialization = () => {
    setTempDoctorData((prev) => ({
      ...prev,
      specializations: [...prev.specializations, specializations[0]?.name],
    }));
  };

  const handleAddCompetency = () => {
    setTempDoctorData((prev) => ({
      ...prev,
      competencies: [...prev.competencies, competencies[0]?.name],
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    if (field === 'enabled') {
      setTempDoctorData((prev) => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            ...prev.workingHours[day],
            enabled: value,
          },
        },
      }));
      setMessage('');
      return;
    }

    const timeRegex = /^[0-1]?[0-9]|2[0-3]:[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      setMessage({
        type: 'warning',
        message: `Format invalid pentru ${day}. Utilizează formatul HH:MM!`,
      });
      return;
    }

    const formattedTime = formatTimeTo24Hour(value);

    const newHours = {
      ...tempDoctorData.workingHours[day],
      [field]: formattedTime,
    };

    if (newHours.start && newHours.end && newHours.start >= newHours.end) {
      setMessage({
        type: 'warning',
        message: `${day}: Selectează o oră de sfârșit ulterioară celei de început!`,
      });
      return;
    }

    setTempDoctorData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: newHours,
      },
    }));
    setMessage('');
  };

  const renderWorkingDays = (workingHours = {}) => {
    return (
      <div style={{ display: 'flex', gap: '10px', color: 'green' }}>
        {DAYS_OF_WEEK.map((day) => {
          const hours = workingHours[day] || { enabled: false };
          return (
            <div
              key={day}
              style={{
                textAlign: 'center',
              }}
            >
              <FaTooth
                color={{ filter: hours.enabled ? 'green' : 'gray' }}
                style={{ filter: hours.enabled ? '' : 'opacity(0.3)' }}
              />
              <div>{day[0]}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatTimeTo24Hour = (time) => {
    if (!time) return '00:00';

    let [hours, minutes] = time.split(':');

    if (!hours || !minutes) {
      return '00:00';
    }

    hours = parseInt(hours, 10);

    if (hours < 0 || hours > 23) {
      return '00:00';
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempDoctorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (
      currentStep === 1 &&
      (!tempDoctorData.firstName ||
        !tempDoctorData.lastName ||
        !tempDoctorData.email ||
        !tempDoctorData.phone)
    ) {
      setMessage({
        type: 'error',
        message: 'Completează toate informațiile necesare!',
      });
      return '';
    }

    if (tempDoctorData.specializations.length === 0) {
      setMessage({
        type: 'error',
        message: 'Adaugă cel puțin o specializare!',
      });
      return;
    }

    const validationError = validation.validateDoctorForm(
      tempDoctorData.firstName,
      tempDoctorData.lastName,
      tempDoctorData.email,
      tempDoctorData.phone,
      tempDoctorData.specializations
    );

    if (validationError) {
      setMessage({ type: 'error', message: validationError });
      return;
    }
    setMessage('');
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setMessage('');
    setCurrentStep(1);
  };

  const handleDeleteClick = (doctorId, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: buttonRect.top,
      left: buttonRect.left,
      height: buttonRect.height,
      width: buttonRect.width,
    });
    setDoctorToDelete(doctorId);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log('Deleting doctor with ID:', doctorToDelete);
      await admin.deleteDoctor(doctorToDelete);
      setDoctors(
        doctors.filter((doctor) => doctor.doctorId !== doctorToDelete)
      );
      console.log('Doctor deleted successfully');
      setMessage({
        type: 'success',
        message: 'Doctorul a fost șters cu succes!',
      });
      setIsDeletePopupOpen(false);
    } catch (err) {
      console.log('Failed to delete doctor:', err);
      setMessage({ type: 'error', message: 'Eroare la ștergerea doctorului!' });
      setIsDeletePopupOpen(false);
    }
  };

  const cancelDelete = () => {
    setDoctorToDelete(null);
    setIsDeletePopupOpen(false);
  };

  const resetForm = () => {
    setTempDoctorData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specializations: [],
      competencies: [],
      workingHours: { ...DEFAULT_WORKING_HOURS },
    });
    setEditingDoctorId(null);
    setCurrentStep(1);
    setMessage('');
    setShowForm(false);
  };

  const handleUpdate = (doctorId) => {
    const doctorToEdit = doctors.find((doctor) => doctor.doctorId === doctorId);
    console.log('Editing doctor:', doctorToEdit);
    if (doctorToEdit) {
      setTempDoctorData({
        firstName: doctorToEdit.firstName,
        lastName: doctorToEdit.lastName,
        email: doctorToEdit.user.email,
        phone: doctorToEdit.phone,
        specializations: doctorToEdit.specializations,
        competencies: doctorToEdit.competencies,
        workingHours: doctorToEdit.workingHours,
        oldWorkingHours: JSON.parse(JSON.stringify(doctorToEdit.workingHours)),
      });
      setEditingDoctorId(doctorId);
      setShowForm(true);
    }
  };

  const isScheduleConflicting = (newWorkingHours, doctorIdBeingEdited) => {
    for (const day of DAYS_OF_WEEK) {
      const { enabled, start, end } = newWorkingHours[day];

      if (!enabled) continue;

      for (const doc of doctors) {
        if (doc.doctorId === doctorIdBeingEdited) continue; // skip self when editing

        const other = doc.workingHours[day];
        if (!other || !other.enabled) continue;

        // suprapunere: A începe înainte ca B să se termine și B începe înainte ca A să se termine
        const overlap = start < other.end && other.start < end;

        if (overlap) return true;
      }
    }

    return false;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const hasEnabledDay = Object.values(tempDoctorData.workingHours).some(
      (day) => day.enabled
    );

    if (!hasEnabledDay) {
      setMessage({
        type: 'warning',
        message: 'Cel puțin o zi de muncă trebuie marcată!',
      });
      return;
    }

    if (isScheduleConflicting(tempDoctorData.workingHours, editingDoctorId)) {
      setMessage({
        type: 'error',
        message:
          'Programul selectat se suprapune cu alt doctor în aceeași sală!',
      });
      return;
    }

    for (const [day, hours] of Object.entries(tempDoctorData.workingHours)) {
      if (hours.enabled) {
        if (!hours.start || !hours.end) {
          setMessage({
            type: 'warning',
            message: `${day}: Ora de început și cea finală sunt ambele necesare!`,
          });
          return;
        }
        if (hours.start >= hours.end) {
          setMessage({
            type: 'warning',
            message: `${day}: Ora de început trebuie să fie înaintea celei de sfârșit!`,
          });
          return;
        }
      }
    }

    try {
      if (editingDoctorId) {
        console.log('Updating doctor');
        const updatedDoctor = await admin.updateDoctor(editingDoctorId, {
          ...tempDoctorData,
          oldWorkingHours: undefined,
        });
        await fetchDoctors();

        console.log('Updated Doctor:', updatedDoctor);

        console.log(
          'workingHours sent to updateDoctorSlots:',
          updatedDoctor.workingHours
        );

        await availableSlots.updateDoctorSlots(
          updatedDoctor.doctorId,
          updatedDoctor.workingHours,
          tempDoctorData.oldWorkingHours
        );

        // setDoctors(
        //   doctors.map((doctor) =>
        //     doctor.doctorId === editingDoctorId ? updatedDoctor : doctor
        //   )
        // );

        setEditingDoctorId(null);
      } else {
        console.log('Adding doctor');
        const response = await admin.addDoctor(tempDoctorData);
        await fetchDoctors();
        const newDoctor = response.profile;
        console.log('New Doctor:', newDoctor);
        // setDoctors([...doctors, newDoctor]);

        console.log('Updated Doctors List:', [...doctors, newDoctor]);

        await availableSlots.initializeDoctorSlots(
          newDoctor.doctorId,
          newDoctor.workingHours
        );

        setMessage({
          type: 'success',
          message: 'Doctorul a fost adăugat cu succes!',
        });
      }
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  const fullName = `${adminProfile?.firstName} ${adminProfile?.lastName}`;

  return (
    <div className="admin-dashboard-page">
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`admin-dashboard-container ${
          isOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        <div className="admin-header">
          <h1>Gestionare doctori</h1>
          <div className="admin-actions">
            <div className="admin-info">
              <Avatar
                image={
                  user?.data?.profilePicURL ||
                  'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
                }
                name={fullName}
                role={user?.data?.role}
                superRole={'Super Admin'}
                email={user?.data?.email}
              />
            </div>

            <Button
              variant="primary"
              size="medium"
              onClick={() => setShowForm(!showForm)}
              className="btn-add-doctor"
            >
              {showForm ? 'Ascunde formular' : 'Adaugă doctor'}
            </Button>
          </div>
        </div>

        {showForm && (
          <form className="add-doctor-form" onSubmit={handleFormSubmit}>
            <h2>
              {editingDoctorId ? 'Editează doctor' : 'Adaugă un nou doctor'}
            </h2>

            <div className="form-steps-container">
              <div className="form-steps">
                <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                  <span>1</span> Informații personale
                </div>
                <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                  <span>2</span> Program de lucru
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Prenume</label>
                  <input
                    type="text"
                    name="firstName"
                    value={tempDoctorData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nume</label>
                  <input
                    type="text"
                    name="lastName"
                    value={tempDoctorData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={tempDoctorData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="text"
                    name="phone"
                    value={tempDoctorData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specializări</label>
                  {tempDoctorData.specializations.map((spec, index) => (
                    <div key={index} className="specialization-group">
                      <div className="specialization-controls">
                        <select
                          name={`specialization-${index}`}
                          value={spec}
                          onChange={(e) => {
                            const newSpecializations = [
                              ...tempDoctorData.specializations,
                            ];
                            newSpecializations[index] = e.target.value;
                            setTempDoctorData((prev) => ({
                              ...prev,
                              specializations: newSpecializations,
                            }));
                          }}
                          required
                        >
                          {specializations.map((spec) => (
                            <option key={spec.code} value={spec.name}>
                              {spec.name}
                            </option>
                          ))}
                        </select>
                        {tempDoctorData.specializations.length > 1 && (
                          <Button
                            type="button"
                            variant="primary"
                            className="btn-danger remove-specialization"
                            onClick={() => {
                              const newSpecializations =
                                tempDoctorData.specializations.filter(
                                  (_, i) => i !== index
                                );
                              setTempDoctorData((prev) => ({
                                ...prev,
                                specializations: newSpecializations,
                              }));
                            }}
                          >
                            Șterge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="primary"
                    className="btn-add-specialization"
                    onClick={handleAddSpecialization}
                  >
                    Adaugă specializare
                  </Button>
                </div>
                <div className="form-group">
                  <label>Competențe</label>
                  {tempDoctorData.competencies.map((competency, index) => (
                    <div key={index} className="competency-group">
                      <div className="competency-controls">
                        <select
                          name={`competency-${index}`}
                          value={competency}
                          onChange={(e) => {
                            const newCompetencies = [
                              ...tempDoctorData.competencies,
                            ];
                            newCompetencies[index] = e.target.value;
                            setTempDoctorData((prev) => ({
                              ...prev,
                              competencies: newCompetencies,
                            }));
                          }}
                          required
                        >
                          {competencies.map((comp) => (
                            <option key={comp.code} value={comp.name}>
                              {comp.name}
                            </option>
                          ))}
                        </select>
                        {tempDoctorData.competencies.length > 1 && (
                          <Button
                            type="button"
                            variant="primary"
                            className="btn-danger remove-competency"
                            onClick={() => {
                              const newCompetencies =
                                tempDoctorData.competencies.filter(
                                  (_, i) => i !== index
                                );
                              setTempDoctorData((prev) => ({
                                ...prev,
                                competencies: newCompetencies,
                              }));
                            }}
                          >
                            Șterge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="primary"
                    className="btn-add-competency"
                    onClick={handleAddCompetency}
                  >
                    Adaugă competență
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Ore de lucru</label>
                  <div className="working-hours-grid">
                    {DAYS_OF_WEEK.map((day) => {
                      const hours =
                        tempDoctorData.workingHours[day] ||
                        DEFAULT_WORKING_HOURS[day];
                      return (
                        <div key={day} className="working-day-card">
                          <div className="day-header">
                            <h4>{day}</h4>
                            <label className="day-toggle">
                              <input
                                type="checkbox"
                                checked={hours.enabled}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    day,
                                    'enabled',
                                    e.target.checked
                                  )
                                }
                              />
                              Activ
                            </label>
                          </div>
                          {hours.enabled && (
                            <div className="time-inputs">
                              <input
                                type="time"
                                value={hours.start || '09:00'}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    day,
                                    'start',
                                    e.target.value
                                  )
                                }
                              />
                              <span>-</span>
                              <input
                                type="time"
                                value={hours.end || '17:00'}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    day,
                                    'end',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="form-navigation">
              <Button
                type="button"
                variant="danger"
                className="btn-cancel"
                onClick={resetForm}
              >
                Anulează
              </Button>

              <div className="step-buttons">
                {currentStep === 2 && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-prev"
                    onClick={handlePrevStep}
                  >
                    Înapoi
                  </Button>
                )}
                {currentStep === 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="btn-next"
                    onClick={handleNextStep}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="success"
                    className="btn-submit"
                  >
                    {editingDoctorId ? 'Actualizează profil' : 'Adaugă doctor'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}

        <div className="doctor-staff-info">
          <h2>
            <FaUserMd />
            Personal medical
          </h2>
          <h2>
            <FaStethoscope />
            Total doctori {doctors.length}
          </h2>
        </div>

        <table className="doctor-table">
          <thead>
            <tr>
              <th></th>
              <th>Nume</th>
              <th>Contact</th>
              <th>Specializări</th>
              <th>Competențe</th>
              <th>Program de lucru</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.doctorId}>
                <td>
                  <div className="doctor-avatar">
                    <img
                      src={
                        doctor?.user?.profilePicURL ||
                        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                      }
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                    />
                  </div>
                </td>
                <td>
                  <div>{doctor.firstName}</div>
                  <div>{doctor.lastName}</div>
                </td>
                <td>
                  <div>{doctor.phone}</div>
                  <div>{doctor.user.email}</div>{' '}
                </td>
                <td>
                  {(doctor.specializations || []).map((spec, index) => (
                    <div key={index}>{spec}</div>
                  ))}
                </td>
                <td>
                  {(doctor.competencies || []).map((spec, index) => (
                    <div key={index}>{spec}</div>
                  ))}
                </td>
                <td>{renderWorkingDays(doctor.workingHours)}</td>
                <td>
                  <div className="actions-container">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleUpdate(doctor.doctorId)}
                      className="btn-edit-doctor"
                    >
                      <FaEdit /> Editează
                    </Button>

                    <Button
                      variant="danger"
                      size="small"
                      onClick={(e) => handleDeleteClick(doctor.doctorId, e)}
                      className="btn-delete-doctor"
                    >
                      <FaTrashAlt /> Șterge
                    </Button>

                    <Popup
                      isOpen={isdeletePopupOpen}
                      onCancel={cancelDelete}
                      onConfirm={confirmDelete}
                      title="Delete Doctor"
                      message="Va fi șters profilul doctorului definitiv!"
                      position={popupPosition}
                    ></Popup>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  );
};

export default AdminDashboard;
