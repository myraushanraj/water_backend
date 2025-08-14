import slugify from 'slugify';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { AppError } from '../utils/appError.js';

export const listProducts = async (req, res) => {
  const { q, category, minPrice, maxPrice, brand, page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (category) {
    // Accept category as ObjectId or slug
    const byId = category.match(/^[0-9a-fA-F]{24}$/) ? category : null;
    if (byId) filter.category = byId;
    else {
      const cat = await Category.findOne({ slug: category.toLowerCase() }).select('_id');
      if (cat) filter.category = cat._id;
      else filter.category = null; // will result in 0 results
    }
  }
  if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category').sort({ price: 1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page: Number(page), pageSize: Number(limit) } });
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
};

export const createProduct = async (req, res) => {
  const { name, categoryId, description, price, mrp, brand, stock, images, attributes } = req.body;
  const categoryDoc = await Category.findById(categoryId);
  if (!categoryDoc) throw new AppError('Category not found', 404);
  const product = await Product.create({
    name,
    slug: slugify(name, { lower: true, strict: true }),
    category: categoryDoc.id,
    description,
    price,
    mrp,
    brand,
    stock,
    images: images || [],
    attributes: attributes || {},
  });
  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name, { lower: true, strict: true });
  const product = await Product.findByIdAndUpdate(id, updates, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Product not found', 404);
  res.json({ success: true, data: { id } });
}; 