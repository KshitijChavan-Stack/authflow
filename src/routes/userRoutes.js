import express from 'express';
import { userController } from '../controllers/index.js';
import { validate, authenticate } from '../middlewares/index.js';
import { userValidators } from '../validators/index.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);

router.put('/profile', validate(userValidators.updateProfileSchema), userController.updateProfile);

router.put(
  '/password',
  validate(userValidators.changePasswordSchema),
  userController.changePassword
);

router.delete(
  '/account',
  validate(userValidators.deleteAccountSchema),
  userController.deleteAccount
);

export default router;
