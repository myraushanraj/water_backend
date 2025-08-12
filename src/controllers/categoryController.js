import slugify from 'slugify';
import { Category } from '../models/Category.js';
import { AppError } from '../utils/appError.js';

export const listCategories = async (_req, res) => {
  const items = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: items });
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, slug: slugify(name, { lower: true, strict: true }), description });
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name, { lower: true, strict: true });
  const category = await Category.findByIdAndUpdate(id, updates, { new: true });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Category not found', 404);
  res.json({ success: true, data: { id } });
}; 