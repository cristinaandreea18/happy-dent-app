import { server } from '../../config/global';

class TreatmentPlanStore {
  constructor() {
    this.data = null;
  }

  async saveTreatmentPlan(appointmentId, planSteps, date) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/${appointmentId}/treatment-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({ plan: planSteps, date }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        console.error('Eroare răspuns server:', result);
        throw new Error(result.message || 'Eroare la salvarea tratamentului.');
      }

      this.data = result;
      return result;
    } catch (err) {
      console.error('Eroare în saveTreatmentPlan:', err);
      throw err;
    }
  }

  async getTreatmentPlan(appointmentId, date = null) {
    try {
      const url = new URL(
        `${server}/doctor/appointments/${appointmentId}/treatment-plan`
      );
      if (date) {
        url.searchParams.append('date', date);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Eroare răspuns server:', result);
        throw new Error(result.message || 'Nu s-a putut încărca planul.');
      }

      this.data = result;
      return result;
    } catch (err) {
      console.error('Eroare în getTreatmentPlan:', err);
      throw err;
    }
  }

  async getAllTreatmentStepsForPatient(patientId) {
    try {
      const response = await fetch(
        `${server}/doctor/patients/${patientId}/treatment-plan`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || 'Nu s-au putut încărca tratamentele.'
        );
      }

      return result.data;
    } catch (err) {
      console.error('Eroare în getAllTreatmentStepsForPatient:', err);
      throw err;
    }
  }

  async deleteTreatmentStep(stepId) {
    try {
      const response = await fetch(
        `${server}/doctor/appointments/any/treatment-plan/step/${stepId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        console.error('Eroare răspuns server:', result);
        throw new Error(result.message || 'Eroare la ștergerea etapei.');
      }

      return true;
    } catch (err) {
      console.error('Eroare în deleteTreatmentStep:', err);
      throw err;
    }
  }

  
}

export default TreatmentPlanStore;
