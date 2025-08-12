import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'IN' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
    isDeactivated: { type: Boolean, default: false },

    addresses: [AddressSchema],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    otpCodeHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },

    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', UserSchema); 