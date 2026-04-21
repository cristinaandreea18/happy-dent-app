import { server } from '../../config/global';

class ServiceStore {
  constructor() {
    this.data = null;
  }

  async fetchServices() {
    try {
      const response = await fetch(`${server}/doctor/doctors/services`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Eroare la încărcarea serviciilor.');
      }

      // transformă într-un obiect categoric: { Profilaxie: [...], etc. }
      const categorized = {};
      result.data.forEach((srv) => {
        if (!categorized[srv.category]) categorized[srv.category] = [];
        categorized[srv.category].push(srv);
      });

      this.data = categorized;
      return categorized;
    } catch (err) {
      console.error('Eroare în fetchServices:', err);
      throw err;
    }
  }
}

export default ServiceStore;
