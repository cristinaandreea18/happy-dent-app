import './AdminReports.css';
import { useState, useEffect, useContext } from 'react';
import AppContext from '../../state/AppContext';
import Avatar from '../../components/Avatar/Avatar';

import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import Button from '../../components/Button/Button';
import LineChartAppointments from '../../components/LineChartAppointments/LineChartAppointments';
import PieChartRevenue from '../../components/PieChartRevenue/PieChartRevenue';
import BarChartProcedures from '../../components/BarChartProcedures/BarChartProcedures';
import MessageBox from '../../components/MessageBox/MessageBox';

const AdminReports = () => {
  const { admin, user, appointment, treatment } = useContext(AppContext);
  const [adminProfile, setAdminProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [message, setMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(2025);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminId = user?.data?.id;
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i);

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
        message: 'Eroare la încărcare profil admin',
      });
    }
  };

  const fetchDoctors = async () => {
    try {
      const doctorsList = await admin.getDoctorsList();
      setDoctors(doctorsList);

      if (doctorsList.length > 0) {
        setSelectedDoctor(doctorsList[0].doctorId);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        message: 'Eroare la încărcarea medicilor',
      });
    }
  };

  const fetchAppointmentsForDoctor = async () => {
    try {
      const response =
        await appointment.getAppointmentsByDoctorId(selectedDoctor);
      const allAppointments = response?.appointments || [];

      const filtered = allAppointments.filter((a) => {
        const dateObj = new Date(a.appointmentDate);
        const appointmentStatus = a.status;
        return (
          dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year
        );
      });

      setCalendarAppointments(filtered);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    }
  };

  const loadMonthlyReport = async () => {
    if (!selectedDoctor) return;
    setIsLoading(true);
    try {
      const data = await appointment.getMonthlyReportByDoctor(
        selectedDoctor,
        year,
        month
      );
      setReportData(data);

      const summary = await admin.getMonthlySummaryForDoctor(
        selectedDoctor,
        year,
        month
      );
      setRevenueSummary(summary);
      await fetchAppointmentsForDoctor();
    } catch (err) {
      setMessage({ type: 'error', message: 'Eroare la încărcare raport' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const timeSlots = [];
  for (let h = 9; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const MonthlyCalendarView = ({ appointments, year, month }) => {
    const daysWithAppointments = Array.from(
      new Set(
        appointments.map(
          (a) => new Date(a.appointmentDate).toISOString().split('T')[0]
        )
      )
    ).sort();

    const calcTop = (time) => {
      const [h, m] = time.split(':').map(Number);
      return ((h - 9) * 2 + (m >= 30 ? 1 : 0)) * 40 + 40;
    };

    const calcHeight = (duration) => (duration / 30) * 40;

    return (
      <div
        className="calendar-wrapper"
        style={{ ['--days']: daysWithAppointments.length }}
      >
        <div className="calendar">
          <div className="time-column">
            <div className="day-label"></div>
            {timeSlots.map((slot) => (
              <div key={slot} className="time-slot">
                {slot}
              </div>
            ))}
          </div>

          {daysWithAppointments.map((dayStr) => {
            const day = new Date(dayStr);
            const dailyAppointments = appointments.filter((a) =>
              a.appointmentDate.startsWith(dayStr)
            );

            return (
              <div key={dayStr} className="day-column">
                <div className="day-label">
                  {new Date(dayStr).toLocaleDateString('ro-RO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                {dailyAppointments.map((a, idx) => {
                  const top = calcTop(a.time);
                  const height = calcHeight(a.duration || 30);
                  const name =
                    a.patient?.profile?.firstName +
                    ' ' +
                    a.patient?.profile?.lastName;

                  return (
                    <div
                      key={idx}
                      className={`appointment-box ${a.status
                        ?.toLowerCase()
                        .replace(' ', '-')}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      {name}
                      <div className="tooltip">
                        <strong>Motiv:</strong> {a.reason || '—'}
                        <br />
                        <strong>Detalii:</strong> {a.note || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const monthForShow = new Date(year, month - 1).toLocaleString('ro-RO', {
    month: 'long',
  });

  const fullName = `${adminProfile?.firstName} ${adminProfile?.lastName}`;

  return (
    <div className="admin-reports-page">
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`admin-reports-container ${
          isOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        <div className="admin-header">
          <h1>Monitorizare activitate medici</h1>

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
          </div>
        </div>

        <h3 style={{ marginBottom: '2rem' }}>
          Selectează un doctor pentru vizualizarea statisticilor lunare
        </h3>

        <div className="report-filters">
          <label>Doctor:</label>
          <select
            value={selectedDoctor || ''}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="" disabled>
              Selectează un doctor
            </option>
            {doctors.map((doc) => (
              <option key={doc.doctorId} value={doc.doctorId}>
                {doc.firstName} {doc.lastName}
              </option>
            ))}
          </select>

          <label>Lună:</label>
          <select
            onChange={(e) => setMonth(Number(e.target.value))}
            value={month}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('ro-RO', { month: 'long' })}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="medium"
            onClick={loadMonthlyReport}
            disabled={!selectedDoctor}
          >
            {isLoading ? 'Se încarcă...' : 'Generează raport'}
          </Button>
        </div>

        {reportData && (
          <div className="report-table">
            <h3 style={{ marginTop: '2rem' }}>
              Raport lunar pentru Dr. {reportData.doctorName} –{' '}
              {monthForShow.charAt(0).toUpperCase() + monthForShow.slice(1)}
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Finalizate</th>
                  <th>Anulate</th>
                  <th>În așteptare</th>
                  <th>Confirmate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.appointmentsByDay.map((row) => (
                  <tr key={row.date}>
                    <td>
                      {new Date(row.date).toLocaleDateString('ro-RO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td>{row.total}</td>
                    <td>{row.completed}</td>
                    <td>{row.cancelled}</td>
                    <td>{row.pending}</td>
                    <td>{row.confirmed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportData?.appointmentsByDay && (
          <LineChartAppointments data={reportData.appointmentsByDay} />
        )}

        {revenueSummary && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '2rem',
              marginTop: '2rem',
            }}
          >
            <PieChartRevenue
              data={revenueSummary}
              onCategoryClick={(category, index) => {
                setSelectedCategory(category);
                setSelectedCategoryIndex(index);
              }}
            />
            {selectedCategory && (
              <BarChartProcedures
                data={revenueSummary}
                category={selectedCategory}
                colorIndex={selectedCategoryIndex}
              />
            )}
          </div>
        )}

        {calendarAppointments.length > 0 && (
          <>
            <h3 style={{ marginTop: '5rem' }}>
              Calendarul programărilor din luna {monthForShow}
            </h3>
            <MonthlyCalendarView
              appointments={calendarAppointments}
              year={year}
              month={month}
            />
          </>
        )}

        {message && (
          <MessageBox
            type={message.type}
            message={message.message}
            onClose={() => setMessage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminReports;
