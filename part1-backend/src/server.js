const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const app = require('./app');
const { port, httpsPort, useHttps, sslKeyPath, sslCertPath } = require('./config/env');

function resolvePath(p) {
  return path.isAbsolute(p) ? p : path.join(__dirname, '..', p);
}

function startServer() {
  const keyPath = resolvePath(sslKeyPath);
  const certPath = resolvePath(sslCertPath);
  const certsExist = fs.existsSync(keyPath) && fs.existsSync(certPath);

  if (useHttps && certsExist) {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    https.createServer(options, app).listen(httpsPort, () => {
      console.log(`HustleHub+ API listening securely on https://localhost:${httpsPort}`);
    });
  } else {
    if (useHttps && !certsExist) {
      console.warn(
        'USE_HTTPS is true but no SSL certificate was found. Run "npm run gen-cert" to generate one. Falling back to HTTP for now.'
      );
    }
    http.createServer(app).listen(port, () => {
      console.log(`HustleHub+ API listening on http://localhost:${port} (HTTP - dev fallback)`);
    });
  }
}

startServer();
