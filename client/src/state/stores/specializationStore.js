import { server } from '../../config/global';

class SpecializationStore {
  constructor() {
    this.data = null;
  }

  async getSpecializations() {
    try {
      const response = await fetch(`${server}/auth/specializations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || 'Eroare la încărcarea specializărilor.'
        );
      }

      this.data = result.data;
      return result.data;
    } catch (err) {
      console.error('Eroare în fetchSpecializations:', err);
      throw err;
    }
  }
}

export default SpecializationStore;
