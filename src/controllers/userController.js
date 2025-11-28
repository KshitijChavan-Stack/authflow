import { userService } from '../services/index.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/index.js';

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id; // From authenticate middleware

  const user = await userService.getProfile(userId);

  successResponse(res, 'Profile retrieved successfully', user);
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;

  const user = await userService.updateProfile(userId, updateData);

  successResponse(res, 'Profile updated successfully', user);
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  const result = await userService.changePassword(userId, currentPassword, newPassword);

  successResponse(res, result.message);
});

// Delete account
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { password } = req.body;

  const result = await userService.deleteAccount(userId, password);

  successResponse(res, result.message);
});
