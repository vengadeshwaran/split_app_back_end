const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, OtpVerification } = require('../models');
const AppError = require('../utils/AppError');
const { sendOtpEmail } = require('../utils/mailer');

const generateToken = (userId, email) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '90d' });

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const generateColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
};

class AuthService {
  async register({ fullName, email, password, confirmPassword }) {
    if (!fullName || !email || !password || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }
    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new AppError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const color_code = generateColor();

    const user = await User.create({
      name: fullName.trim(),
      email,
      password: hashedPassword,
      color_code,
    });

    const token = generateToken(user.id, user.email);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      color_code: user.color_code,
      is_admin: user.is_admin || false,
      preferred_currency: user.preferred_currency || 'Indian Rupee (₹)',
      token,
    };
  }

  async verifyOtp({ email, otp }) {
    if (!email || !otp) {
      throw new AppError('Email and OTP are required', 400);
    }

    const record = await OtpVerification.findOne({ where: { email } });
    if (!record) {
      throw new AppError('No pending verification found. Please register again.', 400);
    }

    if (new Date() > record.expires_at) {
      await record.destroy();
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    if (record.otp !== otp) {
      throw new AppError('Invalid OTP. Please try again.', 400);
    }

    const user = await User.create({
      name: record.full_name,
      email: record.email,
      password: record.hashed_password,
      color_code: record.color_code,
    });

    await record.destroy();

    const token = generateToken(user.id, user.email);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      color_code: user.color_code,
      token,
    };
  }

  async resendOtp({ email }) {
    if (!email) throw new AppError('Email is required', 400);

    const record = await OtpVerification.findOne({ where: { email } });
    if (!record) {
      throw new AppError('No pending registration found. Please register again.', 400);
    }

    const otp = generateOtp();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await record.update({ otp, expires_at });
    await sendOtpEmail(email, otp);

    return { message: 'OTP resent successfully.' };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const token = generateToken(user.id, user.email);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      color_code: user.color_code,
      is_admin: user.is_admin || false,
      preferred_currency: user.preferred_currency || 'Indian Rupee (₹)',
      token,
    };
  }
}

module.exports = new AuthService();
