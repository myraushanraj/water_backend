import { BulkOrder } from '../models/BulkOrder.js';
import { AppError } from '../utils/appError.js';

export const createBulkOrder = async (req, res) => {
  const { type, noOfBottles, deliveryDate, deliveryTime, name, phone, address, pincode, notes } = req.body;
  
  const bulkOrder = await BulkOrder.create({
    type,
    noOfBottles,
    deliveryDate,
    deliveryTime,
    name,
    phone,
    address,
    pincode,
    notes
  });

  res.status(201).json({ success: true, data: bulkOrder });
};

export const getMyBulkOrders = async (req, res) => {
  const bulkOrders = await BulkOrder.find({ phone: req.query.phone }).sort({ createdAt: -1 });
  res.json({ success: true, data: bulkOrders });
};

export const getAllBulkOrders = async (_req, res) => {
  const bulkOrders = await BulkOrder.find().sort({ createdAt: -1 });
  res.json({ success: true, data: bulkOrders });
};

export const getBulkOrderById = async (req, res) => {
  const bulkOrder = await BulkOrder.findById(req.params.id);
  if (!bulkOrder) throw new AppError('Bulk order not found', 404);
  res.json({ success: true, data: bulkOrder });
};

export const updateBulkOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes, assignedDeliveryBoy } = req.body;
  
  const updates = {};
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (assignedDeliveryBoy !== undefined) updates.assignedDeliveryBoy = assignedDeliveryBoy;

  const bulkOrder = await BulkOrder.findByIdAndUpdate(id, updates, { new: true });
  if (!bulkOrder) throw new AppError('Bulk order not found', 404);
  
  res.json({ success: true, data: bulkOrder });
};

export const deleteBulkOrder = async (req, res) => {
  const { id } = req.params;
  const deleted = await BulkOrder.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Bulk order not found', 404);
  res.json({ success: true, data: { id } });
}; 