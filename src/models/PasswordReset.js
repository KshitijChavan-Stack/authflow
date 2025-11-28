import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetSchema = new mongoose.Schema(
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
    isUsed: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ user: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if expired
passwordResetSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual for checking if valid
passwordResetSchema.virtual('isValid').get(function () {
  return !this.isUsed && !this.isExpired;
});

// Static method to generate token
passwordResetSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
