import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    mrp: { type: Number },
    images: [ImageSchema],
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    attributes: { type: Map, of: String },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', ProductSchema); 