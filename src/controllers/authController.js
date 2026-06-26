const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      res.status(200).json({
        message: 'OTP sent to your email. Please verify to complete registration.',
        status: true,
        email: data.email,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const user = await authService.verifyOtp(req.body);
      res.status(201).json({
        message: 'Email verified successfully',
        status: true,
        token: user.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          color_code: user.color_code,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(req, res, next) {
    try {
      await authService.resendOtp(req.body);
      res.status(200).json({ message: 'OTP resent successfully.', status: true });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      res.json({
        message: 'Login successful',
        status: true,
        token: data.token,
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          color_code: data.color_code,
          is_admin: data.is_admin || false,
          preferred_currency: data.preferred_currency || 'Indian Rupee (₹)',
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
