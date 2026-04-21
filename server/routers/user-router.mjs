import express from 'express';
import controllers from './controllers/index.mjs';
import verifyToken from '../middleware/auth.mjs';

//user-router.mjs
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const userRouter = express.Router();
userRouter.put(
  '/updateuserprofilepic',
  upload.single('profilePic'),
  verifyToken,
  controllers.profile.updateUserProfilePic
);

//middleware pentru a verifica daca userul este logat

//Profile routes
userRouter.get(
  '/users/:uuid/profile',
  verifyToken,
  controllers.profile.getUserProfile
);
userRouter.post(
  '/users/:uuid/profile',
  verifyToken,
  controllers.profile.createUserProfile
);
userRouter.put(
  '/users/:uuid/profile',
  verifyToken,
  controllers.profile.updateUserProfile
);

// Appointment routes
userRouter.post(
  '/users/:pid/appointments/appointment',
  verifyToken,
  controllers.appointment.bookAppointment
);

userRouter.get(
  '/patient/:pid/appointments',
  verifyToken,
  controllers.appointment.getAllAppointmentsForPatient
);

userRouter.get(
  '/doctors/:did/availability',
  verifyToken,
  controllers.appointment.getAvailableSlots
);

export default userRouter;
