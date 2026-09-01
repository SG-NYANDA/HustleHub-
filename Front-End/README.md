# HustleHub+

A secure, modern freelance marketplace with service discovery, authentication, bookings, and income tracking. Built with React (frontend) and Node.js (backend).

## Project Structure

```
HustleHub+/
├── frontend/                # React frontend with Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app
│   │   ├── App.css         # Global styles
│   │   └── index.css       # Base styles
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── server.js               # Node.js backend server
├── package.json            # Backend dependencies
├── test/                   # Test files
│   └── marketplace.test.js
└── public/                 # Static assets (legacy)
    ├── index.html
    ├── app.js
    └── styles.css
```

## Quick Start

### Backend Setup

Requires Node.js 20+.

```bash
npm install
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to the backend.

## Features

- 🔐 **Secure Authentication**: Password hashing with scrypt, session tokens, rate limiting
- 💼 **Service Discovery**: Browse and filter freelance services by category
- 📅 **Booking System**: Book services with preferred dates
- 💰 **Income Tracking**: View earnings, tax estimates, and booking history
- 🎨 **Modern UI**: React components with custom CSS styling
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Node.js** - Runtime
- **Node's built-in HTTP module** - Server
- **Crypto** - Password hashing (scrypt)
- **No external dependencies** - Minimal and lightweight

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **CSS** - Custom styling
- **Fetch API** - HTTP client

## Development

### Run Backend
```bash
npm start
```

### Run Frontend (in separate terminal)
```bash
cd frontend
npm run dev
```

### Run Tests
```bash
npm test
```

## Production Build

Build the frontend:
```bash
cd frontend
npm run build
```

Output in `frontend/dist/`

## Security Notes

- Passwords are hashed with Node's `scrypt` and compared with `timingSafeEqual`
- Sessions use cryptographically random opaque tokens
- API responses include security headers (CSP, X-Frame-Options, etc.)
- Requests are rate-limited by source address
- User input is validated for length and type
- HttpOnly, SameSite=Strict cookies for session management

## Production Recommendations

- Replace in-memory data storage with a durable database
- Use a shared session store
- Add CSRF protection for state-changing requests
- Enable TLS/HTTPS
- Implement audit logging
- Integrate with payment provider
- Configure jurisdiction-specific tax rates
- Use environment variables for configuration

## API Endpoints

- `GET /api/services` - Get all services
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/me` - Current user info
- `POST /api/bookings` - Create booking
- `GET /api/dashboard` - User dashboard data

## License

MIT

