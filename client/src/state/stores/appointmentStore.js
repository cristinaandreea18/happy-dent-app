import { server } from '../../config/global';
class AppointmentStore {
  constructor() {
    this.data = null;
  }

  async bookAppointment({
    patientId,
    doctorId,
    appointmentDate,
    time,
    duration,
    reason,
    note,
  }) {
    try {
      const response = await fetch(
        `${server}/user/users/${patientId}/appointments/appointment`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({
            doctorId,
            appointmentDate,
            time,
            duration,
            reason,
            note,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.data = await response.json();
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async deleteAppointment(appointmentId) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/${appointmentId}`,
        {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );
      return await response.json();
    } catch (err) {
      console.error('Delete error:', err);
      return { success: false };
    }
  }

  //appointment
  async getAppointmentsByDoctorId(doctorId) {
    console.log('Getting appointments from doctor with ID:', doctorId);
    try {
      const response = await fetch(
        `${server}/doctor/doctors/${doctorId}/appointments`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.data = await response.json();
      console.log('Appointment Response:', this.data);
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async getAppointmentsByPatientId(patientId, doctorId) {
    try {
      const response = await fetch(
        `${server}/doctor/${doctorId}/patients/${patientId}/appointments`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.data = await response.json();
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async getAllAppointmentsForPatient(patientId) {
    try {
      const response = await fetch(
        `${server}/user/patient/${patientId}/appointments`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.data = await response.json();
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async updateAppointmentStatus(appointmentId, newStatus) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/${appointmentId}/status`,
        {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const updatedAppointment = await response.json();

      if (this.data?.appointments) {
        this.data.appointments = this.data.appointments.map((app) =>
          app.appointmentId === appointmentId
            ? { ...app, status: newStatus }
            : app
        );
      }

      return updatedAppointment;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async updateAppointmentNote(appointmentId, note) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/${appointmentId}/note`,
        {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ note }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const updatedAppointment = await response.json();

      if (this.data?.appointments) {
        this.data.appointments = this.data.appointments.map((app) =>
          app.id === appointmentId ? { ...app, note } : app
        );
      }

      return updatedAppointment;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async updateAppointmentDuration(appointmentId, duration) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/${appointmentId}/duration`,
        {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ duration }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return await response.json();
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async updateAppointmentDateTime(appointmentId, newDateTime) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/${appointmentId}/datetime`,
        {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ newDateTime }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const updatedAppointment = await response.json();

      if (this.data?.appointments) {
        this.data.appointments = this.data.appointments.map((app) =>
          app.id === appointmentId
            ? {
                ...app,
                appointmentDate: newDateTime.split('T')[0],
                time: newDateTime.split('T')[1].slice(0, 5),
              }
            : app
        );
      }

      return updatedAppointment;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async getMonthlyReportByDoctor(doctorId, year, month) {
    try {
      const response = await fetch(
        `${server}/admin/reports/monthly?doctorId=${doctorId}&year=${year}&month=${month}`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const reportData = await response.json();
      this.data = reportData;
      return reportData;
    } catch (err) {
      console.warn('Eroare în getMonthlyReportByDoctor:', err);
      throw err;
    }
  }
}

export default AppointmentStore;
