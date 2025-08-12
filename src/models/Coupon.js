import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['fixed'], default: 'fixed' },
    amount: { type: Number, required: true }, // in INR
    minSubtotal: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', CouponSchema); 