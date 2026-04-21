import express from 'express';
import controllers from './controllers/index.mjs';
import verifyToken from '../middleware/auth.mjs';

const adminRouter = express.Router();

//admin profile
adminRouter.get(
  '/profile/:aid',
  verifyToken,
  controllers.admin.getAdminProfile
);

// //service list
// adminRouter.get('/services', verifyToken, controllers.admin.getAllServices);
// adminRouter.post('/services', verifyToken, controllers.admin.addService);
// adminRouter.put(
//   '/doctor/:did/services',
//   verifyToken,
//   controllers.admin.assignServiceToDoctor
// );
// adminRouter.get(
//   '/doctor/:did/services',
//   verifyToken,
//   controllers.admin.getDoctorServices
// );

//doctor list
adminRouter.post('/doctor', verifyToken, controllers.admin.addDoctor);
adminRouter.get('/doctors', verifyToken, controllers.admin.getDoctorsList);
adminRouter.put('/doctor/:id', verifyToken, controllers.admin.updateDoctor);
adminRouter.delete('/doctor/:id', verifyToken, controllers.admin.deleteDoctor);
adminRouter.get('/doctor/:did', verifyToken, controllers.doctor.getDoctorById);

//
adminRouter.get(
  '/doctor/:doctorId/summary',
  verifyToken,
  controllers.treatment_plan.getMonthlyTreatmentSummaryForDoctor
);
//available-slots

adminRouter.get(
  '/doctors/:did/available-slots',
  verifyToken,
  controllers.available_slots.getAvailableSlots
);
adminRouter.put(
  '/doctors/:did/available-slots',
  verifyToken,
  controllers.available_slots.updateAvailableSlots
);
adminRouter.delete(
  '/doctors/:did/available-slots/clear',
  verifyToken,
  controllers.available_slots.clearAvailableSlots
);
adminRouter.post(
  '/doctors/:did/available-slots/bulk',
  verifyToken,
  controllers.available_slots.bulkUpdateAvailableSlots
);

adminRouter.get(
  '/reports/monthly',
  verifyToken,
  controllers.admin.getMonthlyReportByDoctor
);

export default adminRouter;
