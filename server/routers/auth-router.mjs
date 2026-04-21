import express from 'express';
import controllers from './controllers/index.mjs';
import verifyToken from '../middleware/auth.mjs';

const authRouter = express.Router();

authRouter.post('/login', controllers.auth.loginUser);
authRouter.post('/register', controllers.auth.registerUser);
authRouter.post('/logout', controllers.auth.logoutUser);

authRouter.get(
  '/specializations',
  verifyToken,
  controllers.specialization.getAllSpecializations
);
authRouter.get(
  '/competencies',
  verifyToken,
  controllers.competency.getAllCompetencies
);

authRouter.get(
  '/holidays/:year',
  verifyToken,
  controllers.holiday.getPublicHolidays
);

authRouter.post(
  '/password/forgot-password',
  controllers.auth.requestPasswordReset
);
authRouter.post(
  '/password/reset-password/:token',
  controllers.auth.resetPassword
);
authRouter.post(
  '/password/change',
  verifyToken,
  controllers.auth.changePassword
);

export default authRouter;
