// src/state/HolidayStore.js
import { server } from '../../config/global';

class HolidayStore {
  async getHolidaysByYear(year) {
    try {
      const response = await fetch(`${server}/auth/holidays/${year}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const holidays = await response.json();

      return holidays;
    } catch (err) {
      console.warn('Error fetching holidays:', err);
      return [];
    }
  }
}

export default HolidayStore;
