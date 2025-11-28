import mongoose from 'mongoose';
import crypto from 'crypto';

const emailVerificationSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Indexes
// emailVerificationSchema.index({ token: 1 });
emailVerificationSchema.index({ user: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if expired
emailVerificationSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual for checking if valid
emailVerificationSchema.virtual('isValid').get(function () {
  return !this.isUsed && !this.isExpired;
});

// Static method to generate token
emailVerificationSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

export default EmailVerification;
