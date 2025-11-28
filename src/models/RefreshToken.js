import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    replacedBy: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if expired
refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual for checking if active
refreshTokenSchema.virtual('isActive').get(function () {
  return !this.isRevoked && !this.isExpired;
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
