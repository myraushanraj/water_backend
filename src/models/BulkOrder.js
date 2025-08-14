import mongoose from 'mongoose';

const BulkOrderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['RO Water', 'Bisleri', 'Kinley'],
      required: true
    },
    noOfBottles: {
      type: Number,
      required: true,
      min: 1
    },
    deliveryDate: {
      type: Date,
      required: true
    },
    deliveryTime: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
      default: 'pending'
    },
    notes: String,
    assignedDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const BulkOrder = mongoose.model('BulkOrder', BulkOrderSchema); 