import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';

function generateToken(id) {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError('Validation error', 422, errors.array());
  const { name, email, password, phone } = req.body;
  
  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) throw new AppError('Email already in use', 409);
  
  // Check if phone already exists
  const phoneExists = await User.findOne({ phone });
  if (phoneExists) throw new AppError('Phone number already in use', 409);
  
  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ 
    success: true, 
    data: { 
      token: token, 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone,
      role: user.role 
    } 
  });
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError('Validation error', 422, errors.array());
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid credentials', 401);
  const match = await user.comparePassword(password);
  if (!match) throw new AppError('Invalid credentials', 401);
  const token = generateToken(user.id);
  setAuthCookie(res, token);
  res.json({ success: true, data: { token, id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
};

export const logout = async (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, data: user });
};

export const requestOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otpCodeHash +otpExpiresAt');
  if (!user) throw new AppError('User not found', 404);
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  user.otpCodeHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendEmail({
    to: user.email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
  res.json({ success: true, data: { message: 'OTP sent to email' } });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otpCodeHash +otpExpiresAt');
  if (!user || !user.otpCodeHash || !user.otpExpiresAt) throw new AppError('OTP not requested', 400);
  if (user.otpExpiresAt.getTime() < Date.now()) throw new AppError('OTP expired', 400);
  const isValid = await bcrypt.compare(otp, user.otpCodeHash);
  if (!isValid) throw new AppError('Invalid OTP', 400);
  user.otpCodeHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  const token = generateToken(user.id);
  setAuthCookie(res, token);
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');
  if (!user) throw new AppError('User not found', 404);
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset',
    html: `<p>Reset your password by clicking <a href="${resetUrl}">here</a>. Link expires in 1 hour.</p>`
  });
  res.json({ success: true, data: { message: 'Password reset email sent' } });
};

export const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ email }).select('+resetPasswordTokenHash +resetPasswordExpiresAt +password');
  if (!user || !user.resetPasswordTokenHash) throw new AppError('Invalid token', 400);
  if (user.resetPasswordTokenHash !== tokenHash) throw new AppError('Invalid token', 400);
  if (user.resetPasswordExpiresAt.getTime() < Date.now()) throw new AppError('Token expired', 400);
  user.password = password;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();
  res.json({ success: true, data: { message: 'Password updated' } });
}; 