import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/appError.js';
import { paymentService } from '../services/payment/paymentService.js';
import { Coupon } from '../models/Coupon.js';

export const createOrder = async (req, res) => {
  const { items, address, notes, couponCode } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw new AppError('No items provided', 400);

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems = items.map((i) => {
    const p = productMap.get(i.productId);
    if (!p) throw new AppError('Product not found or inactive', 400);
    if (p.stock < i.quantity) throw new AppError(`Insufficient stock for ${p.name}`, 400);
    subtotal += p.price * i.quantity;
    return { product: p.id, name: p.name, price: p.price, quantity: i.quantity, image: p.images?.[0]?.url || '' };
  });

  const shippingFee = 0;
  let discount = 0;
  let appliedCoupon;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    const now = Date.now();
    if (coupon && coupon.isActive && (!coupon.startsAt || coupon.startsAt.getTime() <= now) && (!coupon.expiresAt || coupon.expiresAt.getTime() >= now) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && subtotal >= (coupon.minSubtotal || 0)) {
      if (coupon.discountType === 'fixed') discount = Math.min(coupon.amount, subtotal);
      appliedCoupon = coupon;
    }
  }

  const total = Math.max(0, subtotal - discount + shippingFee);

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    address,
    subtotal,
    shippingFee,
    total,
    status: 'pending',
    payment: { provider: paymentService.provider, status: 'pending', amount: total, currency: 'INR' },
    notes,
  });

  // Reserve stock (decrement)
  await Promise.all(orderItems.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })));

  if (appliedCoupon) {
    await Coupon.findByIdAndUpdate(appliedCoupon.id, { $inc: { usedCount: 1 } });
  }

  const paymentInit = await paymentService.createPayment({ orderId: order.id, amount: total, currency: 'INR' });

  if (paymentInit?.referenceId) {
    order.payment.referenceId = paymentInit.referenceId;
    order.payment.metadata = paymentInit.metadata || {};
    await order.save();
  }

  res.status(201).json({ success: true, data: { order, payment: paymentInit, discount, coupon: appliedCoupon?.code || null } });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

export const getAllOrders = async (_req, res) => {
  const orders = await Order.find().populate('user').sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // processing, shipped, delivered, cancelled, refunded
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
};

export const adminRefundOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found', 404);
  const result = await paymentService.refundPayment({ order });
  if (result?.success) {
    order.status = 'refunded';
    order.payment.status = 'refunded';
    await order.save();
  }
  res.json({ success: true, data: { refund: result, order } });
}; 