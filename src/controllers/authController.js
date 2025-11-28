import { authService } from '../services/index.js';
import { successResponse, createdResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/index.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const result = await authService.register({ email, password, firstName, lastName });

  createdResponse(res, result.message, { user: result.user });
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const result = await authService.verifyEmail(token);

  successResponse(res, result.message);
});

// Resend verification email
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.resendVerificationEmail(email);

  successResponse(res, result.message);
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const result = await authService.login(email, password, ipAddress, userAgent);

  successResponse(res, 'Login successful', result);
});

// Refresh access token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  successResponse(res, 'Token refreshed successfully', result);
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = req.token; // From authenticate middleware

  await authService.logout(refreshToken, accessToken);

  successResponse(res, 'Logged out successfully');
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const ipAddress = req.ip;

  const result = await authService.forgotPassword(email, ipAddress);

  successResponse(res, result.message);
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  successResponse(res, result.message);
});
