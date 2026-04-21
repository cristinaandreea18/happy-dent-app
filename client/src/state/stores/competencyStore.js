import { server } from '../../config/global';

class CompetencyStore {
  constructor() {
    this.data = null;
  }

  async getCompetencies() {
    try {
      const response = await fetch(`${server}/auth/competencies`, {
        headers: {
          method: 'GET',
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || 'Eroare la încărcarea competențelor.'
        );
      }

      this.data = result.data;
      return result.data;
    } catch (err) {
      console.error('Eroare în fetchCompetencies:', err);
      throw err;
    }
  }
}

export default CompetencyStore;
