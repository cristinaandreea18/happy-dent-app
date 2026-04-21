import express from 'express';
import controllers from './controllers/index.mjs';
import verifyToken from '../middleware/auth.mjs';

const doctorRouter = express.Router();

doctorRouter.get(
  '/doctors/patients',
  verifyToken,
  controllers.doctor.getPacientList
);
doctorRouter.get(
  '/doctors/patient/:pid',
  verifyToken,
  controllers.doctor.getPacientById
);
doctorRouter.get('/:did', verifyToken, controllers.doctor.getDoctorProfile);
doctorRouter.delete(
  '/appointments/:aid',
  verifyToken,
  controllers.appointment.deleteAppointment
);

doctorRouter.get(
  '/doctors/:did/appointments',
  verifyToken,
  controllers.appointment.getAppointmentsByDoctorId
);
doctorRouter.get(
  '/:did/patients/:pid/appointments',
  verifyToken,
  controllers.appointment.getAppointmentsByPatientId
);
doctorRouter.put(
  '/appointments/:aid/status',
  verifyToken,
  controllers.appointment.updateAppointmentStatus
);
doctorRouter.put(
  '/appointments/:aid/note',
  verifyToken,
  controllers.appointment.updateAppointmentNote
);
doctorRouter.put(
  '/appointments/:aid/duration',
  verifyToken,
  controllers.appointment.updateAppointmentDuration
);
doctorRouter.put(
  '/appointments/:aid/datetime',
  verifyToken,
  controllers.appointment.updateAppointmentDateTime
);
doctorRouter.get(
  '/doctors/:did/available-slots',
  verifyToken,
  controllers.available_slots.getAvailableSlots
);
doctorRouter.put(
  '/doctors/:did/available-slots',
  verifyToken,
  controllers.available_slots.updateAvailableSlots
);
doctorRouter.get(
  '/appointments/:appointmentId/treatment-plan',
  verifyToken,
  controllers.treatment_plan.getTreatmentPlan
);
doctorRouter.post(
  '/appointments/:appointmentId/treatment-plan',
  verifyToken,
  controllers.treatment_plan.saveTreatmentPlan
);
doctorRouter.delete(
  '/appointments/:appointmentId/treatment-plan/step/:stepId',
  verifyToken,
  controllers.treatment_plan.deleteTreatmentStep
);
doctorRouter.get(
  '/patients/:patientId/treatment-plan',
  verifyToken,
  controllers.treatment_plan.getAllTreatmentStepsForPatient
);

//pdf generation
doctorRouter.post(
  '/patients/:patientId/treatment-plan/pdf',
  verifyToken,
  controllers.doctor.generateTreatmentPdf
);

//doctor services
doctorRouter.get(
  '/doctors/services',
  verifyToken,
  controllers.service.getAllServices
);

export default doctorRouter;
