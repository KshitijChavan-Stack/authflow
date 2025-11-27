import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';

class UserService {
  // Get user profile
  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const { firstName, lastName, email } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed
    if (email && email !== user.email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }

      user.email = email;
      user.isEmailVerified = false; // Require re-verification

      // TODO: Send verification email for new email
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isEmailVerified: user.isEmailVerified,
    };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from current password');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return {
      message: 'Password changed successfully',
    };
  }

  // Delete account
  async deleteAccount(userId, password) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ValidationError('Password is incorrect');
    }

    // Soft delete (deactivate)
    user.isActive = false;
    await user.save();

    // TODO: Revoke all tokens
    // TODO: Schedule permanent deletion after X days

    logger.info(`Account deactivated for user: ${user.email}`);

    return {
      message: 'Account has been deactivated successfully',
    };
  }
}

export default new UserService();
