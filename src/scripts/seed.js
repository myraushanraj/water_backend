import mongoose from 'mongoose';
import slugify from 'slugify';
import { connectToDatabase } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';

async function run() {
  await connectToDatabase();
  await Promise.all([Product.deleteMany({}), Category.deleteMany({})]);

  const categories = await Category.insertMany([
    { name: 'Water', slug: 'water', description: 'Packaged drinking water and mineral water' },
    { name: 'Grocery', slug: 'grocery', description: 'Daily grocery essentials' },
  ]);

  const [waterCat, groceryCat] = categories;

  const products = [
    { name: 'Bisleri Mineral Water 1L', price: 25, brand: 'Bisleri', stock: 200, category: waterCat.id, images: [{ url: 'https://via.placeholder.com/300x300?text=Bisleri+1L' }] },
    { name: 'Aquafina Pack 500ml x 12', price: 180, brand: 'Aquafina', stock: 100, category: waterCat.id, images: [{ url: 'https://via.placeholder.com/300x300?text=Aquafina+Pack' }] },
    { name: 'Tata Rock Salt 1kg', price: 60, brand: 'Tata', stock: 150, category: groceryCat.id, images: [{ url: 'https://via.placeholder.com/300x300?text=Rock+Salt' }] },
    { name: 'Fortune Sunflower Oil 1L', price: 140, brand: 'Fortune', stock: 80, category: groceryCat.id, images: [{ url: 'https://via.placeholder.com/300x300?text=Sunflower+Oil' }] },
  ].map((p) => ({ ...p, slug: slugify(p.name, { lower: true, strict: true }) }));

  await Product.insertMany(products);

  // Seed admin user
  const adminEmail = 'admin@ecomgro.local';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: 'Admin', email: adminEmail, password: 'admin123', phone: '+919876543210', role: 'admin' });
    console.log('✅ Seeded admin user:', adminEmail, 'password: admin123');
  }

  // Seed coupon GET25 for INR 25 discount
  await Coupon.updateOne(
    { code: 'GET25' },
    { $setOnInsert: { code: 'GET25', description: '₹25 off', discountType: 'fixed', amount: 25, isActive: true } },
    { upsert: true }
  );

  console.log('✅ Seeded categories, products and coupon GET25');
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
}); 