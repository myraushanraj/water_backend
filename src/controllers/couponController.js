import { Coupon } from '../models/Coupon.js';
import { AppError } from '../utils/appError.js';

function isCurrentlyValid(c) {
  const now = Date.now();
  if (!c.isActive) return false;
  if (c.startsAt && c.startsAt.getTime() > now) return false;
  if (c.expiresAt && c.expiresAt.getTime() < now) return false;
  if (c.maxUses && c.usedCount >= c.maxUses) return false;
  return true;
}

export const listCoupons = async (_req, res) => {
  const items = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
};

export const validateCoupon = async (req, res) => {
  const { code, subtotal } = req.query;
  if (!code) throw new AppError('Coupon code required', 400);
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  if (!coupon || !isCurrentlyValid(coupon)) throw new AppError('Invalid coupon', 400);
  if (subtotal && Number(subtotal) < (coupon.minSubtotal || 0)) throw new AppError('Subtotal too low for this coupon', 400);
  res.json({ success: true, data: coupon });
};

export const createCoupon = async (req, res) => {
  const { code, description, amount, minSubtotal, startsAt, expiresAt, maxUses, isActive } = req.body;
  const exists = await Coupon.findOne({ code: String(code).toUpperCase() });
  if (exists) throw new AppError('Coupon already exists', 409);
  const coupon = await Coupon.create({ code: String(code).toUpperCase(), description, amount, minSubtotal, startsAt, expiresAt, maxUses, isActive });
  res.status(201).json({ success: true, data: coupon });
};

export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.code) updates.code = String(updates.code).toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ success: true, data: coupon });
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  const deleted = await Coupon.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Coupon not found', 404);
  res.json({ success: true, data: { id } });
}; 