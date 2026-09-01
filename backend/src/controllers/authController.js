const userStore = require('../models/userStore');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/token');
const AppError = require('../utils/AppError');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = userStore.findByEmail(email);
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const passwordHash = await hashPassword(password);
    const newUser = userStore.create({ name, email, passwordHash, role });

    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: userStore.toPublicUser(newUser),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = userStore.findByEmail(email);

    const genericAuthError = () => new AppError('Invalid email or password.', 401);

    if (!user) {
      return next(genericAuthError());
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (!passwordMatches) {
      return next(genericAuthError());
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userStore.toPublicUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = userStore.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    res.status(200).json({
      success: true,
      data: { user: userStore.toPublicUser(user) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getCurrentUser };
