import { server } from '../../config/global';

class AvailableSlotsStore {
  constructor() {
    this.data = null;
  }

  async getAvailableSlots(doctorId, appointmentDate) {
    try {
      const response = await fetch(
        `${server}/doctor/doctors/${doctorId}/available-slots?appointmentDate=${appointmentDate}`,
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
      console.error('Error fetching available slots:', err);
      throw err;
    }
  }

  async updateAvailableSlots(doctorId, appointmentDate, slots) {
    try {
      const response = await fetch(
        `${server}/doctor/doctors/${doctorId}/available-slots`,
        {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ appointmentDate, slots }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      const updatedAvailableSlots = await response.json();
      this.data = updatedAvailableSlots;
      return updatedAvailableSlots;
    } catch (err) {
      console.error('Error updating available slots:', err);
      throw err;
    }
  }

  async clearAvailableSlots(doctorId, appointmentDate) {
    try {
      const response = await fetch(
        `${server}/admin/doctors/${doctorId}/available-slots/clear`,
        {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ appointmentDate }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return await response.json();
    } catch (err) {
      console.error('Error clearing available slots:', err);
      throw err;
    }
  }

  async bulkUpdateAvailableSlots(doctorId, dateSlots) {
    try {
      const response = await fetch(
        `${server}/admin/doctors/${doctorId}/available-slots/bulk`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ dateSlots }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return await response.json();
    } catch (err) {
      console.error('Error in bulk update of available slots:', err);
      throw err;
    }
  }

  // Admin-specific methods
  async initializeDoctorSlots(doctorId, workingHours, weeksToInitialize = 22) {
    try {
      const dateSlots = this.generateDateSlots(workingHours, weeksToInitialize);
      return await this.bulkUpdateAvailableSlots(doctorId, dateSlots);
    } catch (err) {
      console.error('Error initializing doctor slots:', err);
      throw err;
    }
  }

  async updateDoctorSlots(
    doctorId,
    newWorkingHours,
    oldWorkingHours,
    weeksToUpdate = 22
  ) {
    try {
      // Încearcă să vezi dacă există deja sloturi
      const today = new Date().toISOString().split('T')[0];
      const existing = await this.getAvailableSlots(doctorId, today);

      if (!existing || existing.slots.length === 0) {
        // Dacă nu are sloturi, initializează direct
        return await this.initializeDoctorSlots(
          doctorId,
          newWorkingHours,
          weeksToUpdate
        );
      }

      const dateSlots = this.generateUpdateSlots(
        newWorkingHours,
        oldWorkingHours,
        weeksToUpdate
      );
      await this.bulkUpdateAvailableSlots(
        doctorId,
        dateSlots.filter((slot) => slot.slots.length > 0)
      );

      // Clear slots for disabled days
      const datesToClear = this.generateDatesToClear(
        newWorkingHours,
        oldWorkingHours,
        weeksToUpdate
      );
      await Promise.all(
        datesToClear.map((date) => this.clearAvailableSlots(doctorId, date))
      );
    } catch (err) {
      console.error('Error updating doctor slots:', err);
      throw err;
    }
  }

  // Helper methods
  generateDateSlots(workingHours, weeksToInitialize) {
    const dateSlots = [];
    const startDate = new Date('2025-03-01');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + weeksToInitialize * 7);

    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const daySchedule = workingHours[dayName];

      if (daySchedule?.enabled) {
        const formattedDate = currentDate.toLocaleDateString('en-CA');
        const slots = this.generateSlotsForDay(daySchedule);
        dateSlots.push({ date: formattedDate, slots });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateSlots;
  }

  generateUpdateSlots(newWorkingHours, oldWorkingHours, weeksToUpdate) {
    const dateSlots = [];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + weeksToUpdate * 7);

    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const newDaySchedule = newWorkingHours[dayName];
      const oldDaySchedule = oldWorkingHours?.[dayName];

      const formattedDate = currentDate.toLocaleDateString('en-CA');

      if (newDaySchedule?.enabled) {
        // If day was disabled or hours changed
        if (
          !oldDaySchedule?.enabled ||
          newDaySchedule.start !== oldDaySchedule.start ||
          newDaySchedule.end !== oldDaySchedule.end
        ) {
          const slots = this.generateSlotsForDay(newDaySchedule);
          dateSlots.push({ date: formattedDate, slots });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateSlots;
  }

  generateDatesToClear(newWorkingHours, oldWorkingHours, weeksToUpdate) {
    const datesToClear = [];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + weeksToUpdate * 7);

    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const newDaySchedule = newWorkingHours[dayName];
      const oldDaySchedule = oldWorkingHours?.[dayName];

      const formattedDate = currentDate.toLocaleDateString('en-CA');

      // If day was enabled and now is disabled
      if (!newDaySchedule?.enabled && oldDaySchedule?.enabled) {
        datesToClear.push(formattedDate);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesToClear;
  }

  generateSlotsForDay(daySchedule, slotDuration = 30) {
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    const slots = [];
    for (
      let minutes = startTotalMinutes;
      minutes < endTotalMinutes;
      minutes += slotDuration
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      );
    }
    return slots;
  }
}

export default AvailableSlotsStore;
