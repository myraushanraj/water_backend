import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const dashboardStats = async (_req, res) => {
  const [sales, orders, customers, lowStock] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: ['processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.find({ stock: { $lte: 10 } }, 'name stock').limit(20),
  ]);
  res.json({ success: true, data: { revenue: sales?.[0]?.revenue || 0, orders, customers, lowStock } });
};

export const listCustomers = async (_req, res) => {
  const users = await User.find({ role: 'customer' }).select('-password');
  res.json({ success: true, data: users });
};

export const setCustomerActive = async (req, res) => {
  const { id } = req.params;
  const { isDeactivated } = req.body;
  const user = await User.findByIdAndUpdate(id, { isDeactivated: !!isDeactivated }, { new: true });
  res.json({ success: true, data: user });
}; 