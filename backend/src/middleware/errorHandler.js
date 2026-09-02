const { isProduction } = require('../config/env');

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large.',
    });
  }

  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again later.';

  if (!err.isOperational) {
    console.error('[UNEXPECTED ERROR]', err);
  } else if (!isProduction) {
    console.warn('[HANDLED ERROR]', err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'The requested resource was not found.',
  });
}

module.exports = { errorHandler, notFoundHandler };
