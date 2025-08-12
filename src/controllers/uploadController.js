import path from 'path';

export const handleUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fname = req.file.filename;
  const url = `/uploads/products/${fname}`;
  res.status(201).json({ success: true, data: { url } });
}; 