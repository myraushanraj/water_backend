import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { User } from '../models/User.js';

export async function protect(req, _res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
    if (!token) throw new AppError('Not authenticated', 401);
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user || user.isDeactivated) throw new AppError('User not found or deactivated', 401);
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Forbidden', 403));
    next();
  };
} 