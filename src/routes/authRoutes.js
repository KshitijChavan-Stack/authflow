import express from 'express';
import { authController } from '../controllers/index.js';
import { validate, authenticate, authLimiter, passwordResetLimiter } from '../middlewares/index.js';
import { authValidators } from '../validators/index.js';

const router = express.Router();

// Public routes
router.post('/register', validate(authValidators.registerSchema), authController.register);

router.post(
  '/verify-email',
  validate(authValidators.verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  validate(authValidators.resendVerificationSchema),
  authController.resendVerification
);

router.post('/login', authLimiter, validate(authValidators.loginSchema), authController.login);

router.post('/refresh', validate(authValidators.refreshTokenSchema), authController.refreshToken);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(authValidators.forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(authValidators.resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post('/logout', authenticate, authController.logout);

export default router;
