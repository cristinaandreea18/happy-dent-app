import { server } from '../../config/global';

class AdminStore {
  constructor() {
    this.data = null;
  }

  async getDoctorsList() {
    try {
      const response = await fetch(`${server}/admin/doctors`, {
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
      console.warn(err);
      throw err;
    }
  }

  async addDoctor(doctorData) {
    try {
      console.log('Sending doctor data to server:', doctorData);

      const response = await fetch(`${server}/admin/doctor`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ doctorData }),
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
      console.warn(err);
      throw err;
    }
  }

  async updateDoctor(doctorId, doctorData) {
    try {
      console.log('Updating doctor with ID:', doctorId);
      const response = await fetch(`${server}/admin/doctor/${doctorId}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify(doctorData),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (err) {
      console.warn('Error in updateDoctor:', err);
      throw err;
    }
  }

  async deleteDoctor(doctorId) {
    try {
      console.log('Deleting doctor with ID:', doctorId);
      const response = await fetch(`${server}/admin/doctor/${doctorId}`, {
        method: 'delete',
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
      console.warn('Error in deleteDoctor:', err);
      throw err;
    }
  }

  async getDoctorById(doctorId) {
    try {
      console.log('Getting doctor profile with ID:', doctorId);
      const response = await fetch(`${server}/admin/doctor/${doctorId}`, {
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

      const doctorData = await response.json();
      console.log('Doctor Profile Response:', doctorData);
      return doctorData;
    } catch (err) {
      console.warn('Error in getDoctorById:', err);
      throw err;
    }
  }

  async getAdminProfile(adminId) {
    try {
      console.log('Getting admin profile with ID:', adminId);
      const response = await fetch(`${server}/admin/profile/${adminId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });
      console.log('Token aaaa:', localStorage.getItem('token'));

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.data = await response.json();
      console.log('API Response:', this.data);
      return this.data;
    } catch (err) {
      console.warn('Error in getAdminProfile:', err);
    }
  }

  async getMonthlySummaryForDoctor(doctorId, year, month) {
    try {
      const url = new URL(`${server}/admin/doctor/${doctorId}/summary`);
      url.searchParams.append('year', year);
      url.searchParams.append('month', month);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        console.error('Eroare răspuns server:', result);
        throw new Error(result.message || 'Eroare la obținere summary.');
      }

      return result.summary;
    } catch (err) {
      console.error('Eroare în getMonthlySummaryForDoctor:', err);
      throw err;
    }
  }
}

export default AdminStore;
