import { User, RefreshToken, EmailVerification, PasswordReset } from '../models/index.js';
import tokenService from './tokenService.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/errors.js';

class AuthService {
  // Register new user
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    // Generate email verification token
    const verificationToken = EmailVerification.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await EmailVerification.create({
      user: user._id,
      token: verificationToken,
      expiresAt,
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, firstName, verificationToken);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    logger.info(`New user registered: ${email}`);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  // Verify email
  async verifyEmail(token) {
    const verification = await EmailVerification.findOne({ token }).populate('user');

    if (!verification) {
      throw new NotFoundError('Invalid verification token');
    }

    if (verification.isUsed) {
      throw new ValidationError('Verification token has already been used');
    }

    if (verification.isExpired) {
      throw new ValidationError('Verification token has expired');
    }

    // Update user
    const user = verification.user;
    user.isEmailVerified = true;
    await user.save();

    // Mark token as used
    verification.isUsed = true;
    await verification.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    logger.info(`Email verified for user: ${user.email}`);

    return {
      message: 'Email verified successfully. You can now login.',
    };
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    // Invalidate old tokens
    await EmailVerification.updateMany({ user: user._id, isUsed: false }, { isUsed: true });

    // Generate new token
    const verificationToken = EmailVerification.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await EmailVerification.create({
      user: user._id,
      token: verificationToken,
      expiresAt,
    });

    // Send email
    await emailService.sendVerificationEmail(email, user.firstName, verificationToken);

    logger.info(`Verification email resent to: ${email}`);

    return {
      message: 'Verification email sent successfully',
    };
  }

  // Login
  async login(email, password, ipAddress, userAgent) {
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new UnauthorizedError(
        'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user._id,
      user.email,
      user.role
    );

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
      ipAddress,
      userAgent,
    });

    logger.info(`User logged in: ${email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.userId,
    }).populate('user');

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (!storedToken.isActive) {
      throw new UnauthorizedError('Refresh token is no longer valid');
    }

    // Get user
    const user = storedToken.user;

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    // Generate new access token
    const newAccessToken = tokenService.generateAccessToken(user._id, user.email, user.role);

    // Generate new refresh token (rotation)
    const newRefreshToken = tokenService.generateRefreshToken(user._id);

    // Save new refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await RefreshToken.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt: refreshTokenExpiry,
      ipAddress: storedToken.ipAddress,
      userAgent: storedToken.userAgent,
    });

    // Revoke old refresh token
    storedToken.isRevoked = true;
    storedToken.replacedBy = newRefreshToken;
    await storedToken.save();

    logger.info(`Tokens refreshed for user: ${user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout
  async logout(refreshToken, accessToken) {
    if (refreshToken) {
      // Revoke refresh token
      const storedToken = await RefreshToken.findOne({ token: refreshToken });
      if (storedToken) {
        storedToken.isRevoked = true;
        await storedToken.save();
      }
    }

    if (accessToken) {
      // Blacklist access token
      try {
        const decoded = tokenService.verifyAccessToken(accessToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await tokenService.blacklistToken(accessToken, expiresIn);
        }
      } catch (error) {
        // Token might be invalid, that's okay
        logger.warn('Error blacklisting token during logout:', error.message);
      }
    }

    logger.info('User logged out successfully');

    return {
      message: 'Logged out successfully',
    };
  }

  // Forgot password
  async forgotPassword(email, ipAddress) {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Invalidate old password reset tokens
    await PasswordReset.updateMany({ user: user._id, isUsed: false }, { isUsed: true });

    // Generate password reset token
    const resetToken = PasswordReset.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await PasswordReset.create({
      user: user._id,
      token: resetToken,
      expiresAt,
      ipAddress,
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, user.firstName, resetToken);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    logger.info(`Password reset requested for: ${email}`);

    return {
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const passwordReset = await PasswordReset.findOne({ token }).populate('user');

    if (!passwordReset) {
      throw new NotFoundError('Invalid password reset token');
    }

    if (passwordReset.isUsed) {
      throw new ValidationError('Password reset token has already been used');
    }

    if (passwordReset.isExpired) {
      throw new ValidationError('Password reset token has expired');
    }

    // Update user password
    const user = passwordReset.user;
    user.password = newPassword;
    await user.save();

    // Mark token as used
    passwordReset.isUsed = true;
    await passwordReset.save();

    // Revoke all refresh tokens for security
    await RefreshToken.updateMany({ user: user._id, isRevoked: false }, { isRevoked: true });

    logger.info(`Password reset for user: ${user.email}`);

    return {
      message: 'Password reset successfully. Please login with your new password.',
    };
  }
}

export default new AuthService();
