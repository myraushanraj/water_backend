import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    image: String,
  },
  { _id: false }
);

const AddressSnapshotSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['stripe', 'razorpay', 'none'], default: 'none' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    amount: Number,
    currency: { type: String, default: 'INR' },
    referenceId: String,
    metadata: Object,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [OrderItemSchema],
    address: AddressSnapshotSchema,
    subtotal: Number,
    shippingFee: { type: Number, default: 0 },
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    payment: PaymentSchema,
    notes: String,
    assignedDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', OrderSchema); 