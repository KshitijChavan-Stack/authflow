import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';
import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

class TokenService {
  // Generate Access Token
  generateAccessToken(userId, email, role) {
    const payload = {
      userId,
      email,
      role,
      type: 'access',
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });
  }

  // Generate Refresh Token
  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh',
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    });
  }

  // Verify Access Token
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      if (decoded.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid access token');
      }
      throw error;
    }
  }

  // Verify Refresh Token
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  // Blacklist Token (using Redis)
  async blacklistToken(token, expiresIn) {
    try {
      const redis = getRedisClient();
      const key = `blacklist:${token}`;

      // Store in Redis with expiration
      await redis.setex(key, expiresIn, 'blacklisted');

      logger.info('Token blacklisted successfully');
    } catch (error) {
      logger.error('Error blacklisting token:', error);
      throw error;
    }
  }

  // Check if Token is Blacklisted
  async isTokenBlacklisted(token) {
    try {
      const redis = getRedisClient();
      const key = `blacklist:${token}`;

      const result = await redis.get(key);
      return result !== null;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      return false; // Fail open for availability
    }
  }

  // Generate Token Pair
  generateTokenPair(userId, email, role) {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }
}

export default new TokenService();
