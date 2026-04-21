import { server } from '../../config/global';

class DoctorStore {
  constructor() {
    this.data = null;
  }

  async getPatientList() {
    try {
      const response = await fetch(`${server}/doctor/doctors/patients`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });
      if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = await response.json();
      console.log('Response', this.data);
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async getPatientById(id) {
    try {
      const response = await fetch(`${server}/doctor/doctors/patient/${id}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = await response.json();
      console.log('Response', this.data);
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async getDoctorProfile(doctorId) {
    try {
      console.log('Getting doctor profile with user ID:', doctorId);
      const response = await fetch(`${server}/doctor/${doctorId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.data = await response.json();
      console.log('API Response:', this.data);
      return this.data;
    } catch (err) {
      console.warn('Error in getDoctorProfile:', err);
    }
  }

  async downloadTreatmentPdf(patientId, patientName, treatmentPlan) {
    try {
      const response = await fetch(
        `${server}/doctor/patients/${patientId}/treatment-plan/pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({
            patientName,
            treatmentPlan,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Fisa_${patientName.replace(/\s+/g, '_')}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Eroare la descărcarea PDF-ului:', err);
      throw err;
    }
  }
}
export default DoctorStore;
