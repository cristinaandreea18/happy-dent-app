import auth from './auth-controller.mjs';
import profile from './user-controller.mjs';
import doctor from './doctor-controller.mjs';
import admin from './admin-controller.mjs';
import appointment from './appointment-controller.mjs';
import available_slots from './available-slots-controller.mjs';
import treatment_plan from './treatment-plan-controller.mjs';
import service from './service-controller.mjs';
import specialization from './specialization-controller.mjs';
import competency from './competency-controller.mjs';
import holiday from './holiday-controller.mjs';

export default {
  auth,
  admin,
  profile,
  doctor,
  appointment,
  available_slots,
  treatment_plan,
  service,
  specialization,
  competency,
  holiday,
};
