import React, { useEffect, useState, useContext, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import AppContext from '../../state/AppContext';
import MessageBox from '../MessageBox/MessageBox';
import Popup from '../Popup/Popup';
import Button from '../Button/Button';
import { FaEdit, FaStickyNote, FaUserPlus } from 'react-icons/fa';
import './WeeklyCalendar.css';

const transformWorkingHours = (workingHours) => {
  if (!workingHours) return [];

  const daysMap = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };

  const workingHoursEvents = [];

  Object.entries(workingHours).forEach(([dayName, daySchedule]) => {
    if (daySchedule && daySchedule.enabled) {
      const dayOfWeek = daysMap[dayName];

      workingHoursEvents.push({
        id: `working_${dayName}`,
        title: 'Program cabinet',
        daysOfWeek: [dayOfWeek],
        startTime: daySchedule.start,
        endTime: daySchedule.end,
        startRecur: '2025-01-01',
        display: 'background',
        color: 'rgba(220, 252, 231, 0.5)',
        classNames: ['working-hours'],
        extendedProps: {
          isWorkingHours: true,
        },
      });
    }
  });

  return workingHoursEvents;
};

const WeeklyCalendar = ({ doctorId }) => {
  const { user, appointment, doctor, availableSlots, holiday } =
    useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [showCancelDeletePopup, setShowCancelDeletePopup] = useState(false);
  const [moveInfo, setMoveInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [message, setMessage] = useState(false);
  const calendarRef = useRef(null);
  const selectionRef = useRef(null);

  const [newAppointment, setNewAppointment] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const [currentDateRange, setCurrentDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  console.log('Slots store', availableSlots);
  const userId = user?.data?.id;
  const role = user?.data?.role;
  console.log('Appointments STORE', appointments);

  const oldEventStartRef = useRef(null);

  const isPastAppointment =
    selectedEvent && new Date(selectedEvent.startTime) < new Date();

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const year = new Date().getFullYear();
        const holidayEvents = await holiday.getHolidaysByYear(year);

        setHolidays(holidayEvents);
        setAppointments((prev) => [...prev, ...holidayEvents]);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea zilelor libere!',
        });
      }
    };

    loadHolidays();
  }, []);

  useEffect(() => {
    console.log('🔵 Evenimente în calendar:', appointments);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.refetchEvents();
    }

    const availableSlots = findAvailableSlots(
      appointments,
      workingHours,
      30,
      currentDateRange
    );

    console.log('Available slots', availableSlots);
  }, [appointments, currentDateRange]);

  const getEventColor = (status) => {
    const statusColors = {
      'In asteptare': 'var(--status-pending)',
      Confirmata: 'var(--status-confirmed)',
      Anulata: 'var(--status-cancelled)',
      Finalizata: 'var(--status-completed)',
    };
    return statusColors[status];
  };

  const EventWithPlus = ({ event }) => (
    <div className="event-content">
      <div className="event-title">{event.title}</div>
      <div className="event-plus">+</div>
    </div>
  );

  const handleEventClick = (clickInfo) => {
    console.log('Event clicked:', clickInfo.event);
    try {
      const event = clickInfo.event;

      if (event.extendedProps?.isHoliday) {
        setMessage({
          type: 'info',
          message: `Atenție! ${event.title} este o zi nelucrătoare.`,
        });
        return;
      }

      const selected = {
        appointmentId: event.extendedProps.appointmentId,
        startTime: event.start,
        endTime: event.end,
        duration: event.extendedProps.duration,
        reason: event.extendedProps.reason,
        note: event.extendedProps.note,
        title: event.title,
        status: event.extendedProps.status,
      };

      setSelectedEvent(selected);

      if (selected.status === 'Anulata') {
        setShowCancelDeletePopup(true);
      }
    } catch (error) {
      console.error('Error handling event click:', error);
    }
  };

  //handleEventDrop
  // console.log('Data veche (din dragStart):', oldStart);
  //console.log('Data nouă (din drop):', dropInfo.event.start);

  const handleEventDragStart = (dragInfo) => {
    oldEventStartRef.current = new Date(dragInfo.event.start);
  };

  const handleEventDrop = async (dropInfo) => {
    const oldStart = oldEventStartRef.current;
    const event = dropInfo.event;

    if (event.extendedProps.isWorkingHours) {
      dropInfo.revert();
      return;
    }

    const isWithinWorkingHours = checkWorkingHours(
      dropInfo.event.start,
      dropInfo.event.end
    );

    if (!isWithinWorkingHours) {
      setMessage({
        type: 'error',
        message: 'Intervalul ales este în afara orelor de program!',
      });
      dropInfo.revert();
      return;
    }
    setMoveInfo({
      event: event,
      oldStart: oldStart,
      newStart: event.start,
      revert: dropInfo.revert,
    });

    setShowMoveConfirmation(true);
  };

  //
  const handleMoveCancel = () => {
    if (moveInfo) {
      moveInfo.revert();
    }
    setShowMoveConfirmation(false);
    setMoveInfo(null);
  };

  //  console.log('🔁 New Start:', newStart);
  //console.log('⏳ Duration:', duration);

  const handleMoveConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const newStart = moveInfo.newStart;
      const duration = moveInfo.event.extendedProps.duration;
      const newEnd = new Date(newStart);
      newEnd.setMinutes(newEnd.getMinutes() + duration);

      const hasConflict = appointments.some((ev) => {
        if (!isSameDay(new Date(ev.start), newStart)) return false;

        if (ev.id === moveInfo.event.id || ev.extendedProps.isWorkingHours)
          return false;

        const evStart = new Date(ev.start);
        const evEnd = new Date(
          evStart.getTime() + ev.extendedProps.duration * 60000
        );

        return (
          (newStart < evEnd && newEnd > evStart) ||
          newStart.getTime() === evStart.getTime()
        );
      });

      if (hasConflict) {
        setMessage({
          type: 'error',
          message: 'Această oră se suprapune cu altă programare!',
          onClose: () => {
            setShowMoveConfirmation(true);
          },
        });
        moveInfo.revert();
        return;
      }

      const response = await appointment.updateAppointmentDateTime(
        moveInfo.event.id,
        moveInfo.newStart.toISOString()
      );

      if (!response.success) throw new Error('Update failed');

      const refreshedAppointments =
        await appointment.getAppointmentsByDoctorId(doctorId);
      const refreshedData = refreshedAppointments.appointments.map((app) => ({
        id: app.appointmentId,
        title: `${app.patient.profile.firstName} ${app.patient.profile.lastName}`,
        start: `${app.appointmentDate.slice(0, 10)}T${app.time}`,
        end: calculateEndTime(
          app.appointmentDate.slice(0, 10),
          app.time,
          app.duration
        ),
        color: getEventColor(app.status),
        extendedProps: {
          appointmentId: app.appointmentId,
          status: app.status,
          reason: app.reason,
          note: app.note,
          duration: app.duration,
        },
      }));

      setAppointments([
        ...refreshedData,
        ...transformWorkingHours(workingHours),
        ...holidays,
      ]);

      const oldDate = moveInfo.oldStart.toISOString().split('T')[0];
      const newDate = moveInfo.newStart.toISOString().split('T')[0];

      await Promise.all([
        updateAvailableSlotsInDB(oldDate, refreshedData),
        updateAvailableSlotsInDB(newDate, refreshedData),
      ]);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setMessage({
        type: 'error',
        message: 'Eroare la actualizarea programării!',
      });
      moveInfo.revert();
    } finally {
      setIsProcessing(false);
      setShowMoveConfirmation(false);
      setMoveInfo(null);
      oldEventStartRef.current = null;
    }
  };

  // console.log('Data veche (din ref):', oldDate);
  //console.log('Data nouă:', newDate);

  const handleSelect = (selectInfo) => {
    console.log('Eveniment selectat', selectInfo);
    selectionRef.current = selectInfo;

    const start = selectInfo.start;
    const end = selectInfo.end;
    const duration = (end - start) / (1000 * 60);

    const isHoliday = holidays.some((holiday) => {
      const holidayDate = new Date(holiday.start).toDateString();
      return holidayDate === start.toDateString();
    });

    if (isHoliday) {
      setMessage({
        type: 'error',
        message: 'Nu se pot face programări în zilele de sărbătoare!',
      });
      selectInfo.view.calendar.unselect();
      return;
    }

    const isWithinWorkingHours = checkWorkingHours(start, end);

    if (!isWithinWorkingHours) {
      setMessage({
        type: 'error',
        message: 'Intervalul selectat este în afara orelor de program!',
      });
      selectInfo.view.calendar.unselect();
      return;
    }

    const hasConflict = checkEventConflict(start, end);

    if (hasConflict) {
      setMessage({
        type: 'error',
        message: 'Există deja o programare în acest interval!',
      });
      selectInfo.view.calendar.unselect();
      return;
    }

    setNewAppointment({
      startTime: start,
      endTime: end,
      duration: duration,
      reason: '',
      note: '',
    });
    setShowAppointmentForm(true);
  };

  const handleDeleteCancelledAppointment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await appointment.deleteAppointment(
        selectedEvent.appointmentId
      );

      if (!response.success) throw new Error('Delete failed');

      const refreshedAppointments =
        await appointment.getAppointmentsByDoctorId(doctorId);
      const refreshedData = refreshedAppointments.appointments.map((app) => ({
        id: app.appointmentId,
        title: `${app.patient.profile.firstName} ${app.patient.profile.lastName}`,
        start: `${app.appointmentDate.slice(0, 10)}T${app.time}`,
        end: calculateEndTime(
          app.appointmentDate.slice(0, 10),
          app.time,
          app.duration
        ),
        color: getEventColor(app.status),
        extendedProps: {
          appointmentId: app.appointmentId,
          status: app.status,
          reason: app.reason,
          note: app.note,
          duration: app.duration,
        },
      }));
      const deletedDate = selectedEvent.startTime.toISOString().split('T')[0];

      await updateAvailableSlotsInDB(deletedDate, refreshedData);

      setAppointments([
        ...refreshedData,
        ...transformWorkingHours(workingHours),
        ...holidays,
      ]);

      setMessage({
        type: 'success',
        message: 'Programarea a fost ștearsă!',
      });
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setMessage({
        type: 'error',
        message: 'Eroare la ștergerea programării!',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const checkWorkingHours = (start, end) => {
    const day = start.toLocaleDateString('en-US', { weekday: 'long' });
    const dayWorkingHours = workingHours[day];

    if (!dayWorkingHours || !dayWorkingHours.enabled) return false;

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const [workingStartHour, workingStartMinute] = dayWorkingHours.start
      .split(':')
      .map(Number);
    const [workingEndHour, workingEndMinute] = dayWorkingHours.end
      .split(':')
      .map(Number);

    const workingStart = workingStartHour + workingStartMinute / 60;
    const workingEnd = workingEndHour + workingEndMinute / 60;

    return startHour >= workingStart && endHour <= workingEnd;
  };

  const checkEventConflict = (start, end) => {
    return appointments.some((event) => {
      if (event.extendedProps?.isWorkingHours) return false;

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end || event.start);

      return start < eventEnd && end > eventStart;
    });
  };

  const handleSaveNewAppointment = async () => {
    try {
      if (!selectedPatientId) {
        setMessage({
          type: 'error',
          message: 'Selectați un pacient!',
        });
        return;
      }
      console.log('Selected patient ID:', selectedPatientId);

      const response = await appointment.bookAppointment({
        patientId: selectedPatientId,
        doctorId: doctorId,
        appointmentDate: newAppointment.startTime.toISOString().split('T')[0],
        time: formatTime(newAppointment.startTime),
        duration: newAppointment.duration,
        reason: newAppointment.reason || 'Consultație programată',
        note: newAppointment.note || '',
      });

      if (!response.success) throw new Error('Booking failed');

      const refreshedAppointments =
        await appointment.getAppointmentsByDoctorId(doctorId);
      const refreshedData = refreshedAppointments.appointments.map((app) => {
        return {
          id: app.appointmentId,
          title: ` ${app.patient.profile.firstName} ${app.patient.profile.lastName}`,
          start: `${app.appointmentDate.slice(0, 10)}T${app.time}`,
          end: calculateEndTime(
            app.appointmentDate.slice(0, 10),
            app.time,
            app.duration
          ),
          color: getEventColor(app.status),
          extendedProps: {
            appointmentId: app.appointmentId,
            status: app.status,
            reason: app.reason,
            note: app.note,
            duration: app.duration,
          },
        };
      });

      setAppointments([
        ...refreshedData,
        ...transformWorkingHours(workingHours),
        ...holidays,
      ]);

      //
      const date = newAppointment.startTime.toISOString().split('T')[0];
      await updateAvailableSlotsInDB(date, refreshedData);
      //
      if (selectionRef.current) {
        selectionRef.current.view.calendar.unselect();
        selectionRef.current = null;
      }

      setMessage({
        type: 'success',
        message: 'Programarea a fost creată cu succes!',
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      setMessage({
        type: 'error',
        message: 'Eroare la crearea programării',
      });
    } finally {
      setNewAppointment(null);
      setSelectedPatientId('');
      setShowAppointmentForm(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await appointment.updateAppointmentStatus(
        selectedEvent.appointmentId,
        'Finalizata'
      );

      if (!response.success) throw new Error('Update failed');

      const refreshedAppointments =
        await appointment.getAppointmentsByDoctorId(doctorId);
      const refreshedData = refreshedAppointments.appointments.map((app) => ({
        id: app.appointmentId,
        title: `${app.patient.profile.firstName} ${app.patient.profile.lastName}`,
        start: `${app.appointmentDate.slice(0, 10)}T${app.time}`,
        end: calculateEndTime(
          app.appointmentDate.slice(0, 10),
          app.time,
          app.duration
        ),
        color: getEventColor(app.status),
        extendedProps: {
          appointmentId: app.appointmentId,
          status: app.status,
          reason: app.reason,
          note: app.note,
          duration: app.duration,
        },
      }));

      setAppointments([
        ...refreshedData,
        ...transformWorkingHours(workingHours),
        ...holidays,
      ]);

      setMessage({
        type: 'success',
        message: 'Programarea a fost marcată ca finalizată!',
      });
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setMessage({
        type: 'error',
        message: 'Eroare la marcarea programării ca finalizată',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const findAvailableSlots = (
    appointments,
    workingHours,
    slotDuration = 30,
    currentWeekRange
  ) => {
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const bookedAppointments = appointments.filter(
      (app) => !app.extendedProps?.isWorkingHours
    );

    const availableSlots = [];

    const getEnglishDayName = (date) => {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const daysInWeek = [];
    let currentDate = new Date(currentWeekRange.start);

    while (
      currentDate.getDay() !== 1 &&
      currentDate >= currentWeekRange.start
    ) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (let i = 0; i < 7; i++) {
      daysInWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    daysInWeek.forEach((date) => {
      const englishDayName = getEnglishDayName(date);
      const schedule = workingHours[englishDayName];

      if (!schedule || !schedule.enabled) {
        availableSlots.push({
          dayName: date.toLocaleDateString('ro-RO', { weekday: 'long' }),
          date: date.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
          }),
          fullDate: formatLocalDate(date),
          slots: [],
        });
        return;
      }

      const daySlots = [];
      const [startHour, startMinute] = schedule.start.split(':').map(Number);
      const [endHour, endMinute] = schedule.end.split(':').map(Number);
      const dayStartMinutes = startHour * 60 + startMinute;
      const dayEndMinutes = endHour * 60 + endMinute;

      for (
        let minutes = dayStartMinutes;
        minutes < dayEndMinutes;
        minutes += slotDuration
      ) {
        daySlots.push(minutes);
      }

      const dayBookedAppointments = bookedAppointments.filter((app) => {
        const appDate = new Date(app.start);
        return (
          appDate.getDate() === date.getDate() &&
          appDate.getMonth() === date.getMonth() &&
          appDate.getFullYear() === date.getFullYear()
        );
      });

      dayBookedAppointments.forEach((app) => {
        const appStart = new Date(app.start);
        const appStartMinutes =
          appStart.getHours() * 60 + appStart.getMinutes();
        const appEndMinutes = appStartMinutes + app.extendedProps.duration;

        for (let i = 0; i < daySlots.length; i++) {
          const slotStart = daySlots[i];
          const slotEnd = slotStart + slotDuration;

          if (
            (slotStart >= appStartMinutes && slotStart < appEndMinutes) ||
            (slotEnd > appStartMinutes && slotEnd <= appEndMinutes) ||
            (slotStart <= appStartMinutes && slotEnd >= appEndMinutes)
          ) {
            daySlots.splice(i, 1);
            i--;
          }
        }
      });

      availableSlots.push({
        dayName: date.toLocaleDateString('ro-RO', { weekday: 'long' }),
        date: date.toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
        }),
        fullDate: formatLocalDate(date),
        slots: daySlots.map((minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}`;
        }),
      });
    });

    return availableSlots;
  };

  const updateAvailableSlotsInDB = async (date, appointments) => {
    try {
      console.log('Updating slots for date:??', date);
      const availableSlotsData = findAvailableSlots(
        appointments,
        workingHours,
        30,
        currentDateRange
      );
      console.log('All available slots data:', availableSlotsData);

      const formattedDate = new Date(date).toISOString().split('T')[0];
      const dayData = availableSlotsData.find(
        (slot) => slot.fullDate === formattedDate
      );

      console.log('Found day data:', dayData);

      const daySlots = dayData?.slots || [];
      console.log('Slots to update:', daySlots);

      const result = await availableSlots.updateAvailableSlots(
        doctorId,
        formattedDate,
        daySlots
      );

      console.log('Update result:', result);
    } catch (error) {
      console.error('Error updating available slots:', error);
      throw error;
    }
  };

  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await doctor.getPatientList();
        setPatients(patientsData);
        if (patientsData.length > 0) {
          setSelectedPatientId(patientsData[0].id);
        }
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea pacienților!',
        });
      }
    };
    fetchPatients();
  }, [doctor]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const year = new Date().getFullYear();
        const holidayEvents = await holiday.getHolidaysByYear(year);
        setHolidays(holidayEvents);

        const appointmentResponse =
          await appointment.getAppointmentsByDoctorId(doctorId);
        const appointmentData = appointmentResponse.appointments;
        console.log('Appointments data:', appointmentData);

        const doctorResponse = await doctor.getDoctorProfile(userId);
        const workingHoursData = doctorResponse.workingHours;

        console.log('Doctor response', doctorResponse);
        setWorkingHours(workingHoursData);

        const transformedEvents = appointmentData.map((app) => {
          const duration = app.duration;
          const start = `${app.appointmentDate.slice(0, 10)}T${app.time}`;
          const end = calculateEndTime(
            app.appointmentDate.slice(0, 10),
            app.time,
            duration
          );
          let eventClass = '';
          const statusClass = `status-${app.status
            .toLowerCase()
            .replace(/\s+/g, '-')}`;

          if (duration <= 30) {
            eventClass = 'short-event';
          } else if (duration <= 60) {
            eventClass = 'medium-event';
          } else {
            eventClass = 'long-event';
          }
          return {
            id: app.appointmentId,
            title: ` ${app.patient.profile.firstName} ${app.patient.profile.lastName} `,
            start: start, //"2025-03-07T11:00"
            end: end,
            color: getEventColor(app.status),
            classNames: [statusClass],
            extendedProps: {
              appointmentId: app.appointmentId,
              status: app.status,
              reason: app.reason,
              note: app.note,
              duration: app.duration,
            },
          };
        });

        const workingHoursEvents = transformWorkingHours(workingHoursData);
        setAppointments([
          ...transformedEvents,
          ...workingHoursEvents,
          ...holidayEvents,
        ]);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, [doctorId]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const calculateEndTime = (date, time, duration) => {
    const dateTimeStr = `${date}T${time}`;

    const startDate = new Date(dateTimeStr);
    const endDate = new Date(startDate.getTime() + duration * 60000); //ms

    const pad = (num) => num.toString().padStart(2, '0');
    return `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(
      endDate.getDate()
    )}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return (
    <div className="full-calendar-container">
      <FullCalendar
        datesSet={(dateInfo) => {
          setCurrentDateRange({
            start: dateInfo.start,
            end: dateInfo.end,
          });
        }}
        plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
        initialView="timeGridWeek"
        events={appointments}
        eventContent={(eventInfo) => {
          if (eventInfo.event.extendedProps.isWorkingHours) {
            return null;
          }

          const viewType = eventInfo.view.type;

          if (eventInfo.event.extendedProps.isHoliday) {
            return (
              <div className="event-content holiday-event">
                <div className="event-title">{eventInfo.event.title}</div>
              </div>
            );
          }

          const startTime = eventInfo.event.start.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const endTime = eventInfo.event.end?.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <div className="event-content">
              <div className="event-title">{eventInfo.event.title} </div>
              {viewType === 'dayGridMonth' && (
                <div className="event-time">
                  {' - '} {startTime} - {endTime}
                </div>
              )}
            </div>
          );
        }}
        eventDragStart={handleEventDragStart}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        ref={calendarRef}
        contentHeight="auto"
        aspectRatio={1.5}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={true} //alow dragging and resizing
        unselectAuto={false}
        select={handleSelect}
        selectable={true} // Permite selectarea intervalelor
        selectMirror={true} //afisare previzualizare in timp real odata cu selectia
        selectConstraint={{
          startTime: '09:00',
          endTime: '21:00',
        }}
        height="100%"
        slotMinTime="09:00:00"
        slotMaxTime="21:00:00"
        firstDay={1}
        dayHeaderContent={(arg) => {
          if (arg.view.type !== 'timeGridWeek') return null;

          return (
            <div className="custom-day-header">
              <div className="weekday">
                {arg.date.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="day-number">{arg.date.getDate()}</div>
            </div>
          );
        }}
        dayHeaderFormat={{ weekday: 'long' }}
        allDaySlot={false}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          meridiem: false,
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
      />

      {showMoveConfirmation && moveInfo && (
        <Popup
          isOpen={showMoveConfirmation}
          onCancel={handleMoveCancel}
          onConfirm={handleMoveConfirm}
          title="Confirmă mutarea programării"
          message={`Sigur doriți să mutați programarea la ${moveInfo.newStart.toLocaleDateString(
            'ro-RO'
          )} ${moveInfo.newStart.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
          })}?`}
        />
      )}

      {selectedEvent && (
        <div className="event-details-popup">
          <div className="popup-content">
            <button
              className="close-popup"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            <h4>
              <FaStickyNote />
              Detalii programare {selectedEvent.title}
            </h4>
            <div className="dropdown-divider"></div>
            <p>
              <strong>Interval orar:</strong>{' '}
              {selectedEvent.startTime.toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -{' '}
              {selectedEvent.endTime.toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {selectedEvent.duration && ` (${selectedEvent.duration} minute)`}
            </p>
            <p>
              <strong>Motiv:</strong> {selectedEvent.reason}
            </p>
            <p>
              <strong>Note:</strong> {selectedEvent.note || '-'}
            </p>
            <div className="dropdown-divider"></div>

            {isPastAppointment && (
              <div className="completion-section">
                <p className="completion-message">
                  <FaEdit />
                  Marchezi această programare ca finalizată?
                </p>
                <div className="completion-buttons">
                  <Button
                    type="button"
                    variant="cancelled"
                    size="small"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Anulează
                  </Button>
                  <Button
                    type="button"
                    variant="completed"
                    size="small"
                    onClick={handleMarkAsCompleted}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Se salvează...' : 'Finalizată'}
                  </Button>
                </div>
              </div>
            )}

            {!isPastAppointment && (
              <p className="future-appointment-message">
                Doar o programare din trecut poate fi marcată ca finalizată.
              </p>
            )}
          </div>
        </div>
      )}

      {message && (
        <MessageBox
          type={message.type}
          message={message.message}
          duration={1000}
          onClose={() => setMessage(null)}
        />
      )}

      {showAppointmentForm && newAppointment && (
        <Popup
          isOpen={showAppointmentForm}
          onCancel={() => setShowAppointmentForm(false)}
          onConfirm={handleSaveNewAppointment}
          title="Adaugă o nouă programare"
        >
          <div className="new-appointment-form">
            <div className="form-group">
              <p>
                <strong>Dată:</strong>{' '}
                {newAppointment.startTime.toLocaleDateString('ro-RO')}
              </p>
              <p>
                <strong>Ora start:</strong>{' '}
                {formatTime(newAppointment.startTime)}
              </p>
              <p>
                <strong>Ora sfârșit:</strong>{' '}
                {formatTime(newAppointment.endTime)}
              </p>
              <p>
                <strong>Durată:</strong> {newAppointment.duration} minute
              </p>
            </div>

            <div className="form-group">
              <label>Pacient:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="form-control"
              >
                {patients.map((patient) => (
                  <option key={patient.uuid} value={patient.uuid}>
                    {patient.profile.firstName} {patient.profile.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Motivul programării:</label>
              <input
                type="text"
                value={newAppointment.reason || ''}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    reason: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Observații:</label>
              <textarea
                value={newAppointment.note || ''}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    note: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </Popup>
      )}
      {showCancelDeletePopup && selectedEvent && (
        <Popup
          isOpen={showCancelDeletePopup}
          onCancel={() => {
            setShowCancelDeletePopup(false);
            setSelectedEvent(null);
          }}
          onConfirm={async () => {
            await handleDeleteCancelledAppointment();
            setShowCancelDeletePopup(false);
          }}
          title="Confirmare ștergere"
          message={`Doriți să ștergeți definitiv programarea anulată pentru ${selectedEvent.title}?`}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;
export { transformWorkingHours };
