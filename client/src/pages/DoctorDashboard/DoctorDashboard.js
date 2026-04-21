import './DoctorDashboard.css';
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import DoctorSidebar from '../../components/DoctorSidebar/DoctorSidebar';
import Avatar from '../../components/Avatar/Avatar';
import MessageBox from '../../components/MessageBox/MessageBox';
import Button from '../../components/Button/Button';
import Popup from '../../components/Popup/Popup';
import { GiBackwardTime } from 'react-icons/gi';
import { MdOutlineMoreTime } from 'react-icons/md';

const DoctorDashboard = () => {
  const { doctor, user, appointment, treatmentPlan, service } =
    useContext(AppContext);
  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showMedicalSheetForm, setShowMedicalSheetForm] = useState(false);
  const [treatment, setTreatment] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isDeleteMedicalSheetPopupOpen, setIsDeleteMedicalSheetPopupOpen] =
    useState(false);
  const [showAppointmentsPanel, setShowAppointmentsPanel] = useState(false);
  const [stepToDelete, setStepToDelete] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const navigate = useNavigate();
  const role = user?.data?.role;
  const userId = user?.data?.id;
  const doctorId = user?.data?.doctorId;
  console.log('Treatment plan store', treatmentPlan);
  console.log('Services:', service);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await doctor.getPatientList();
        console.log('Pacienți primiți:', patientsData);
        setPatients(patientsData);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea pacienților!',
        });
      }
    };

    const fetchServices = async () => {
      try {
        const response = await service.fetchServices();
        setServices(response);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea serviciilor!',
        });
      }
    };

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

    fetchPatients();
    fetchDoctorProfile();
    fetchServices();
  }, [userId]);

  const fetchPatientAppointments = async (patientId) => {
    try {
      const response = await appointment.getAppointmentsByPatientId(
        patientId,
        doctorId
      );
      setIsLoadingAppointments(true);
      setPatientAppointments(response.appointments || []);
    } catch (err) {
      setMessage({
        type: 'error',
        message: err.message,
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      console.log('Selected patient:', selectedPatient);
      fetchPatientAppointments(selectedPatient.uuid);
    } else {
      setPatientAppointments([]);
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.profile?.firstName || ''} ${
      patient.profile?.lastName || ''
    }`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const calculateAge = (dateOfBirth) => {
    let age;
    let birtDate = new Date(dateOfBirth);
    let finalToday = '';

    const today = new Date();
    const isoToday = today.toISOString().split('T')[0];

    if (isoToday && isoToday.includes('-')) {
      const parts = isoToday.split('-');
      if (parts.length === 3) {
        var [ty, tm, td] = parts;
        finalToday = `${td}.${tm}.${ty}`;
      }

      if (dateOfBirth && dateOfBirth.includes('.')) {
        const parts = dateOfBirth.split('.');
        if (parts.length === 3) {
          var [db, bm, by] = parts;
          age = ty - by;
          const monthDiff = tm - bm;

          if (monthDiff < 0 || (monthDiff === 0 && finalToday < birtDate)) {
            age--;
          }
        }
      }
    }

    return age;
  };

  const getRelevantAppointments = () => {
    const now = new Date();

    const parseAppointmentDate = (appt) => {
      const date = new Date(appt.appointmentDate);
      console.log('data', date);
      const [hours, minutes] = appt.time.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date;
    };

    const pastAppointments = patientAppointments.filter((appt) => {
      const apptDate = parseAppointmentDate(appt);
      return apptDate < now;
    });

    const upcomingAppointments = patientAppointments.filter((appt) => {
      const apptDate = parseAppointmentDate(appt);
      return apptDate >= now;
    });

    pastAppointments.sort((a, b) => {
      return parseAppointmentDate(b) - parseAppointmentDate(a);
    });

    upcomingAppointments.sort((a, b) => {
      return parseAppointmentDate(a) - parseAppointmentDate(b);
    });

    return {
      lastAppointment: pastAppointments[0] || null,
      nextAppointment: upcomingAppointments[0] || null,
    };
  };

  const getFilteredAppointments = () => {
    if (appointmentFilter === 'all') return patientAppointments;

    const { lastAppointment, nextAppointment } = getRelevantAppointments();

    if (appointmentFilter === 'last' && lastAppointment) {
      return [lastAppointment];
    }

    if (appointmentFilter === 'next' && nextAppointment) {
      return [nextAppointment];
    }

    return [];
  };

  const totalAppointments = getFilteredAppointments();
  const totalPages = Math.ceil(totalAppointments.length / appointmentsPerPage);

  const paginatedAppointments = () => {
    const start = (currentPage - 1) * appointmentsPerPage;
    return totalAppointments.slice(start, start + appointmentsPerPage);
  };

  console.log('doctorProfile', doctorProfile);
  const formatDateRO = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const cancelDeleteMedicalSheet = () => {
    setIsDeleteMedicalSheetPopupOpen(false);
  };

  const confirmDeleteMedicalSheet = () => {
    setShowMedicalSheetForm(false);
    setIsDeleteMedicalSheetPopupOpen(false);
    setMessage({
      type: 'success',
      message: 'Fișa medicală a fost ștearsă.',
    });
  };

  const cancelDeleteTreatmentStep = () => {
    setIsDeletePopupOpen(false);
    setStepToDelete(null);
  };

  const confirmDeleteTreatmentStep = async () => {
    if (stepToDelete === null) return;

    const step = treatment[stepToDelete];
    try {
      if (step.stepId) {
        await treatmentPlan.deleteTreatmentStep(step.stepId);
      }

      const updated = treatment.filter((_, i) => i !== stepToDelete);
      setTreatment(updated);
      setMessage({ type: 'success', message: 'Etapă ștearsă.' });
    } catch (err) {
      setMessage({ type: 'error', message: 'Eroare la ștergerea etapei.' });
    } finally {
      cancelDeleteTreatmentStep();
    }
  };

  let fullName = '';
  if (role === 'doctor') {
    if (doctorProfile?.firstName) {
      fullName = `${doctorProfile?.firstName} ${doctorProfile?.lastName}`;
    } else {
      fullName = 'Doctor nou';
    }
  }

  return (
    <div className="doctor-dashboard-page">
      <DoctorSidebar />
      <div className="doctor-dashboard-container">
        <div className="profile-header">
          <h1>Bine ai revenit, {fullName}!</h1>
          <div className="doctor-actions">
            <div className="doctor-info">
              <Avatar
                image={
                  user?.data?.profilePicURL ||
                  'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
                }
                name={fullName}
                role="doctor"
                superRole={doctor?.data?.specialization}
                email={user?.data?.email}
              />
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="patients-list">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Caută pacientul după nume..."
                className="input-text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bx bx-search"></i>
            </div>

            {filteredPatients.length > 0 ? (
              <div className="patient-cards-grid">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.uuid}
                    className={`patient-card ${
                      selectedPatient?.uuid === patient.uuid ? 'selected' : ''
                    }`}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setCurrentPage(1);
                    }}
                  >
                    <div className="patient-avatar">
                      <img
                        src={
                          patient?.profilePicURL ||
                          'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                        }
                        alt={`${patient.profile?.firstName} ${patient.profile?.lastName}`}
                      />
                    </div>
                    <div className="patient-info">
                      <h2>
                        {patient.profile?.firstName} {patient.profile?.lastName}
                      </h2>
                      <p>Vârstă {calculateAge(patient.profile?.dateOfBirth)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nu au fost găsiți pacienți...</p>
            )}
          </div>
          <div className="right-column">
            {selectedPatient ? (
              <>
                <div className="form-steps">
                  <div className={`step ${step === 1 ? 'active' : ''}`}>
                    <span>1</span> Informații personale
                  </div>
                  <div className={`step ${step === 2 ? 'active' : ''}`}>
                    <span>2</span> Istoric programări
                  </div>
                </div>

                {step === 1 && (
                  <div className="patient-details">
                    <div className="details-container">
                      <div className="patient-header">
                        <img
                          src={
                            selectedPatient?.profilePicURL ||
                            'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                          }
                          alt={`${selectedPatient.profile?.firstName} ${selectedPatient.profile?.lastName}`}
                        />
                        <h2>
                          {selectedPatient.profile?.firstName}{' '}
                          {selectedPatient.profile?.lastName}
                        </h2>
                        <p className="patient-age-gender">
                          {calculateAge(selectedPatient.profile?.dateOfBirth)}{' '}
                          ani • {selectedPatient.profile?.gender || 'N/A'}
                        </p>
                      </div>

                      <div className="details-grid">
                        <div className="detail-section">
                          <h3>Informații de contact</h3>
                          <p>
                            <strong>Email:</strong>{' '}
                            {selectedPatient.profile?.email ||
                              selectedPatient.email ||
                              'N/A'}
                          </p>
                          <p>
                            <strong>Telefon:</strong>{' '}
                            {selectedPatient.profile?.phoneNumber || 'N/A'}
                          </p>
                        </div>

                        <div className="detail-section">
                          <h3>Informații personale</h3>
                          <p>
                            <strong>Data nașterii:</strong>{' '}
                            {selectedPatient.profile?.dateOfBirth || 'N/A'}
                          </p>
                          <p>
                            <strong>Ocupație:</strong>{' '}
                            {selectedPatient.profile?.ocupation || 'N/A'}
                          </p>
                        </div>

                        <div className="detail-section">
                          <h3>Adresă</h3>
                          <p>
                            <strong>Oraș:</strong>{' '}
                            {selectedPatient.profile?.city || 'N/A'}
                          </p>
                          <p>
                            <strong>Județ:</strong>{' '}
                            {selectedPatient.profile?.county || 'N/A'}
                          </p>
                        </div>

                        <div className="details-buttons">
                          <Button
                            variant="wrap"
                            size="small"
                            onClick={async () => {
                              setActiveAppointment(null);
                              setShowTreatmentForm(true);
                              try {
                                const result =
                                  await treatmentPlan.getAllTreatmentStepsForPatient(
                                    selectedPatient.uuid
                                  );
                                const mapped = result.map((step) => ({
                                  ...step,
                                  procedure: step.service?.name || '',
                                  cost: step?.cost || '',
                                  category: step.service?.category || '',
                                  doctorId: step.doctor?.doctorId,
                                  doctor: {
                                    firstName:
                                      step.appointment?.doctor?.firstName,
                                    lastName:
                                      step.appointment?.doctor?.lastName,
                                  },
                                }));
                                setTreatment(mapped);
                              } catch {
                                setTreatment([]);
                              }
                            }}
                            style={{ marginBottom: '5px', marginTop: '5px' }}
                          >
                            Plan de tratament
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="form-navigation-buttons">
                      {step < 2 && (
                        <div
                          style={{
                            flex: 1,
                            textAlign: 'right',
                          }}
                        >
                          <Button
                            variant="secondary"
                            onClick={() => setStep(step + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="patient-appointments">
                    <h3>Istoricul programărilor</h3>
                    <div className="appointment-filters">
                      <Button
                        size="small"
                        variant="secondary"
                        className={appointmentFilter === 'all' ? 'active' : ''}
                        onClick={() => {
                          setAppointmentFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        Toate programările
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        className={appointmentFilter === 'last' ? 'active' : ''}
                        onClick={() => {
                          setAppointmentFilter('last');
                          setCurrentPage(1);
                        }}
                      >
                        <GiBackwardTime />
                        Ultima programare
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        className={appointmentFilter === 'next' ? 'active' : ''}
                        onClick={() => {
                          setAppointmentFilter('next');
                          setCurrentPage(1);
                        }}
                      >
                        <MdOutlineMoreTime />
                        Următoarea programare
                      </Button>
                    </div>

                    {isLoadingAppointments ? (
                      <p>Loading appointments...</p>
                    ) : getFilteredAppointments().length > 0 ? (
                      <div className="appointments-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Dată</th>
                              <th>Oră</th>
                              <th>Durată</th>
                              <th>Status</th>
                              <th>Doctor</th>
                              <th>Motiv</th>
                              <th>Tratament</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedAppointments().map((appt) => (
                              <tr key={appt.appointmentId}>
                                <td>
                                  {new Date(
                                    appt.appointmentDate
                                  ).toLocaleDateString('ro-RO')}
                                </td>
                                <td>{appt.time}</td>
                                <td>{appt.duration} min</td>
                                <td
                                  className={`status-${appt.status
                                    .toLowerCase()
                                    .replace(' ', '-')}`}
                                >
                                  {appt.status}
                                </td>
                                <td>
                                  {appt.doctor?.firstName}{' '}
                                  {appt.doctor?.lastName}
                                </td>
                                <td>{appt.reason}</td>
                                <td>
                                  <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={async () => {
                                      setActiveAppointment(appt);
                                      setShowTreatmentForm(true);
                                      try {
                                        const result =
                                          await treatmentPlan.getTreatmentPlan(
                                            appt.appointmentId,
                                            appt.appointmentDate
                                          );
                                        const mapped = (result.data || []).map(
                                          (step) => ({
                                            ...step,
                                            procedure: step.service?.name || '',
                                            cost: step?.cost || '',
                                            unitPrice: step.service?.price,
                                            category:
                                              step.service?.category || '',
                                            doctorId: step.doctor?.doctorId,
                                            doctor: {
                                              firstName:
                                                step.appointment?.doctor
                                                  ?.firstName,
                                              lastName:
                                                step.appointment?.doctor
                                                  ?.lastName,
                                            },
                                          })
                                        );
                                        setTreatment(mapped);
                                      } catch {
                                        setTreatment([]);
                                      }
                                    }}
                                  >
                                    Plan tratament
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="pagination-bar">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                          >
                            &lt;
                          </Button>

                          <input
                            type="number"
                            className="pagination-input"
                            min="1"
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => {
                              const val = Math.max(
                                1,
                                Math.min(totalPages, Number(e.target.value))
                              );
                              setCurrentPage(val);
                            }}
                          />

                          <span className="pagination-text">
                            of {totalPages}
                          </span>

                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                          >
                            &gt;
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p>
                        Nu au fost regăsite programări pentru acest pacient.
                      </p>
                    )}
                    <div className="form-navigation-buttons">
                      {step > 1 && (
                        <div style={{ flex: 1 }}>
                          <Button
                            variant="secondary"
                            onClick={() => setStep(step - 1)}
                          >
                            Înapoi
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-patient-selected">
                <p>Selectează un pacient pentru a vizualiza informații</p>
              </div>
            )}
          </div>
          {message && (
            <MessageBox
              type={message.type}
              message={message.message}
              duration={3000}
              onClose={() => setMessage(null)}
            />
          )}{' '}
          {showMedicalSheetForm && (
            <div className="treatment-form-popup">
              <div
                className="treatment-form-overlay"
                onClick={() => setShowMedicalSheetForm(false)}
              />
              <div className="treatment-form-container">
                <button
                  className="remove-step-button"
                  title="Șterge fișa medicală"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPopupPosition({
                      top: rect.top + window.scrollY,
                      left: rect.left + window.scrollX,
                      height: rect.height,
                    });
                    setIsDeleteMedicalSheetPopupOpen(true);
                  }}
                >
                  ✕
                </button>

                <h2>
                  Fișă medicală nr.x Pacient:{' '}
                  {selectedPatient?.profile?.firstName}{' '}
                  {selectedPatient?.profile?.lastName}
                </h2>

                <div className="form-group">
                  <label>Antecedente heredocolaterale</label>
                  <textarea
                    rows={2}
                    placeholder="Notează afecțiunile moștenite din familie relevante pentru tratamentul stomatologic."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Antecedente personale</label>
                  <textarea
                    rows={2}
                    placeholder="Completează cu istoricul medical personal al pacientului."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Alergii</label>
                  <textarea
                    rows={2}
                    placeholder="Menționează orice alergii cunoscute ale pacientului."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Tratamente urmate</label>
                  <textarea
                    rows={2}
                    placeholder="Enumeră tratamentele stomatologice efectuate anterior."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Examenul mucoasei orale</label>
                  <textarea
                    rows={2}
                    placeholder="Descrie starea generală a mucoasei orale."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>E.O.P.</label>
                  <textarea
                    rows={2}
                    placeholder="Detaliază starea parodonțiului și observațiile clinice relevante."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Diagnostic</label>
                  <textarea
                    rows={2}
                    placeholder="Redactează diagnosticul stomatologic formulat în urma consultației."
                    className="form-textarea"
                  />
                </div>

                <div className="treatment-form-actions">
                  <Button
                    variant="danger"
                    onClick={() => setShowMedicalSheetForm(false)}
                  >
                    Închide
                  </Button>
                  <Button variant="success" onClick={() => window.print()}>
                    Descarcă PDF
                  </Button>
                </div>
              </div>
              <Popup
                isOpen={isDeleteMedicalSheetPopupOpen}
                onCancel={cancelDeleteMedicalSheet}
                onConfirm={confirmDeleteMedicalSheet}
                title="Confirmare ștergere"
                message="Sigur vrei să ștergi această fișă medicală?"
                position={popupPosition}
              />
            </div>
          )}
          {showTreatmentForm && (
            <div className="treatment-form-popup">
              <div
                className="treatment-form-overlay"
                onClick={() => setShowTreatmentForm(false)}
              />
              <div className="treatment-form-container">
                <h2>
                  Plan de tratament: {selectedPatient?.profile?.firstName}
                  <br />
                  <small>
                    {activeAppointment &&
                      `Programare din ${new Date(
                        activeAppointment.appointmentDate
                      ).toLocaleDateString('ro-RO')}, ora ${
                        activeAppointment.time
                      }`}
                  </small>
                </h2>

                {treatment.map((step, index) => (
                  <div key={index} className="treatment-step">
                    <button
                      className="remove-step-button"
                      title="Șterge etapa"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPopupPosition({
                          top: rect.top + window.scrollY,
                          left: rect.left + window.scrollX,
                          height: rect.height,
                        });
                        setStepToDelete(index);
                        setIsDeletePopupOpen(true);
                      }}
                    >
                      ✕
                    </button>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Servicii</label>

                        <select
                          value={step.category || ''}
                          onChange={(e) => {
                            const newPlan = [...treatment];
                            newPlan[index].category = e.target.value;
                            newPlan[index].procedure = '';
                            newPlan[index].cost = '';
                            newPlan[index].serviceId = null;
                            newPlan[index].details = '';

                            setTreatment(newPlan);
                          }}
                        >
                          <option value="">Alege categoria</option>
                          {Object.keys(services).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Procedură</label>
                        {step.category && (
                          <select
                            value={step.procedure}
                            onChange={(e) => {
                              const selectedService = services[
                                step.category
                              ].find((srv) => srv.name === e.target.value);
                              const newPlan = [...treatment];

                              const isPerDinte =
                                ['PARODONTOLOGIE', 'ORTODONTIE'].includes(
                                  step.category
                                ) &&
                                selectedService.name
                                  .toLowerCase()
                                  .includes('/dinte');

                              const teethCount = step.tooth
                                ? step.tooth
                                    .split(',')
                                    .map((t) => t.trim())
                                    .filter((t) => t.match(/^[0-9]+[a-d]?$/i))
                                    .length
                                : 0;

                              newPlan[index] = {
                                ...newPlan[index],
                                procedure: selectedService.name,
                                unitPrice: selectedService.price,
                                serviceId: selectedService.serviceId,
                                details: selectedService.details,
                                cost:
                                  isPerDinte && teethCount > 0
                                    ? selectedService.price * teethCount
                                    : selectedService.price,
                              };
                              console.log(
                                '[Procedură selectată]',
                                selectedService.name
                              );
                              console.log('[Categorie]', step.category);
                              console.log(
                                '[Este detartraj pe dinte?]',
                                isPerDinte
                              );
                              console.log('[Nr. dinți]', teethCount);
                              console.log('[unitPrice]', selectedService.price);
                              console.log(
                                '[Cost calculat]',
                                isPerDinte && teethCount > 0
                                  ? selectedService.price * teethCount
                                  : selectedService.price
                              );

                              setTreatment(newPlan);
                            }}
                          >
                            <option value="">Alege procedura</option>
                            {services[step.category].map((srv) => (
                              <option key={srv.name} value={srv.name}>
                                {srv.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Cost </label>
                        <input
                          type="number"
                          placeholder="preț estimat"
                          value={step.cost}
                          readOnly
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={step.status}
                          onChange={(e) => {
                            const newPlan = [...treatment];
                            newPlan[index].status = e.target.value;
                            setTreatment(newPlan);
                          }}
                        >
                          <option value="programat">Programat</option>
                          <option value="în curs">În curs</option>
                          <option value="finalizat">Finalizat</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Data programării</label>
                        <input
                          type="text"
                          value={formatDateRO(
                            step.appointment?.appointmentDate ||
                              activeAppointment?.appointmentDate
                          )}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Dinte</label>
                        <input
                          type="text"
                          placeholder="dintele afectat"
                          value={step.tooth}
                          onChange={(e) => {
                            const newTooth = e.target.value;
                            const newPlan = [...treatment];

                            const isPerDinte =
                              ['PARODONTOLOGIE', 'ORTODONTIE'].includes(
                                newPlan[index].category
                              ) &&
                              newPlan[index].procedure
                                .toLowerCase()
                                .includes('/dinte');

                            const teethCount = newTooth
                              ? newTooth
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter((t) => t.match(/^[0-9]+[a-d]?$/i))
                                  .length
                              : 0;

                            newPlan[index] = {
                              ...newPlan[index],
                              tooth: newTooth,
                              cost:
                                isPerDinte &&
                                newPlan[index].unitPrice &&
                                teethCount > 0
                                  ? newPlan[index].unitPrice * teethCount
                                  : newPlan[index].unitPrice ||
                                    newPlan[index].cost,
                            };
                            console.log('[Dinte modificat]', newTooth);
                            console.log(
                              '[Este detartraj pe dinte?]',
                              isPerDinte
                            );
                            console.log('[Nr. dinți]', teethCount);
                            console.log(
                              '[unitPrice]',
                              newPlan[index].unitPrice
                            );
                            console.log(
                              '[Cost recalculat]',
                              isPerDinte &&
                                newPlan[index].unitPrice &&
                                teethCount > 0
                                ? newPlan[index].unitPrice * teethCount
                                : newPlan[index].unitPrice ||
                                    newPlan[index].cost
                            );

                            setTreatment(newPlan);
                          }}
                        />
                      </div>

                      {step.stepId && step.doctorId !== doctorId && (
                        <div className="form-group">
                          <label>Inițiat de</label>
                          <input
                            type="text"
                            value={`Dr. ${
                              step.appointment?.doctor?.firstName || ''
                            } ${step.appointment?.doctor?.lastName || ''}`}
                            readOnly
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label>Detalii procedură</label>
                        <textarea
                          rows="2"
                          placeholder="Observații"
                          value={step.details || ''}
                          onChange={(e) => {
                            const newPlan = [...treatment];
                            newPlan[index].details = e.target.value;
                            setTreatment(newPlan);
                          }}
                          className="form-textarea"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {activeAppointment && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setTreatment([
                        ...treatment,
                        {
                          procedure: '',
                          tooth: '',
                          cost: '',
                          status: 'programat',
                          appointmentDate:
                            activeAppointment?.appointmentDate || '',
                          serviceId: null,
                          category: '',
                          doctorId: doctorId,
                          doctor: {
                            firstName: doctorProfile?.firstName,
                            lastName: doctorProfile?.lastName,
                          },
                        },
                      ])
                    }
                    className="btn-add-step"
                  >
                    + Adaugă etapă
                  </Button>
                )}

                <div className="treatment-form-actions">
                  <Button
                    variant="danger"
                    onClick={() => setShowTreatmentForm(false)}
                  >
                    Închide
                  </Button>

                  <Button
                    variant="success"
                    onClick={async () => {
                      try {
                        await doctor.downloadTreatmentPdf(
                          selectedPatient.uuid,
                          `${selectedPatient.profile.firstName} ${selectedPatient.profile.lastName}`,
                          treatment.map((step) => ({
                            category: step.category,
                            procedure: step.procedure,
                            cost: step.cost,
                            status: step.status,
                            date: step.appointment?.appointmentDate || '',
                            tooth: step.tooth || '',
                            details: step.details || '',
                            doctor: {
                              firstName: step.appointment?.doctor?.firstName,
                              lastName: step.appointment?.doctor?.lastName,
                            },
                          }))
                        );
                      } catch (err) {
                        setMessage({
                          type: 'error',
                          message: 'Eroare la descărcare PDF.',
                        });
                      }
                    }}
                  >
                    Descarcă PDF
                  </Button>

                  {activeAppointment && (
                    <Button
                      variant="success"
                      onClick={async () => {
                        try {
                          console.log(
                            'Treatment payload before saving:',
                            treatment
                          );

                          const updatedTreatment = treatment.map((step) => {
                            const isPerDinte =
                              ['PARODONTOLOGIE', 'ORTODONTIE'].includes(
                                step.category
                              ) &&
                              step.procedure.toLowerCase().includes('/dinte');

                            const teethCount = step.tooth
                              ? step.tooth
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter((t) => t.match(/^[0-9]+[a-d]?$/i))
                                  .length
                              : 0;

                            const unitPrice =
                              Number(step.unitPrice) ||
                              Number(
                                services[step.category]?.find(
                                  (s) => s.name === step.procedure
                                )?.price
                              ) ||
                              0;

                            return {
                              ...step,
                              unitPrice,
                              cost:
                                isPerDinte && unitPrice && teethCount > 0
                                  ? unitPrice * teethCount
                                  : unitPrice || step.cost,
                            };
                          });

                          await treatmentPlan.saveTreatmentPlan(
                            activeAppointment.appointmentId,
                            updatedTreatment,
                            activeAppointment.appointmentDate
                          );
                          console.log(
                            '[Salvare plan] Etape actualizate:',
                            updatedTreatment.map((step) => ({
                              procedure: step.procedure,
                              unitPrice: step.unitPrice,
                              tooth: step.tooth,
                              cost: step.cost,
                            }))
                          );

                          setMessage({
                            type: 'success',
                            message: 'Planul de tratament a fost salvat.',
                          });
                          setShowTreatmentForm(false);
                        } catch (err) {
                          setMessage({
                            type: 'error',
                            message: 'Eroare la salvarea planului.',
                          });
                        }
                      }}
                    >
                      Salvează planul
                    </Button>
                  )}
                </div>

                <Popup
                  isOpen={isDeletePopupOpen}
                  onCancel={cancelDeleteTreatmentStep}
                  onConfirm={confirmDeleteTreatmentStep}
                  title="Confirmare ștergere"
                  message="Sigur vrei să ștergi această procedură?"
                  position={popupPosition}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
