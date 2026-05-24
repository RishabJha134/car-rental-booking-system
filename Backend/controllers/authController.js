const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

async function registerUser(req, res, next, role) {
  try {
    const { name, email, password, phone, address, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      });
    }

    const existingUser = await User.findByEmail(email.toLowerCase());

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
      address,
      city,
    });

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

async function registerCustomer(req, res, next) {
  return registerUser(req, res, next, 'customer');
}

async function registerAgency(req, res, next) {
  return registerUser(req, res, next, 'agency');
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findByEmail(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerCustomer,
  registerAgency,
  login,
};