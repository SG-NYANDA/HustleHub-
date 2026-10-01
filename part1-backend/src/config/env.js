require('dotenv').config();

const required = ['JWT_SECRET'];

function assertRequiredEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and set them before starting the server.'
    );
  }

  if (process.env.JWT_SECRET === 'replace_this_with_a_long_random_string_before_running') {
    throw new Error(
      'JWT_SECRET is still set to the placeholder value from .env.example. ' +
        'Set a strong, unique secret before starting the server.'
    );
  }
}

assertRequiredEnv();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  httpsPort: Number(process.env.HTTPS_PORT) || 5443,
  useHttps: (process.env.USE_HTTPS || 'true').toLowerCase() === 'true',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  sslKeyPath: process.env.SSL_KEY_PATH || 'certs/key.pem',
  sslCertPath: process.env.SSL_CERT_PATH || 'certs/cert.pem',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
};
