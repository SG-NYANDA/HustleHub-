# HustleHub+ React Frontend

A modern React frontend for the HustleHub+ freelance marketplace built with Vite.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── Hero.jsx        # Hero section
│   │   ├── Stats.jsx       # Statistics display
│   │   ├── Discover.jsx    # Service discovery section
│   │   ├── ServiceCard.jsx # Individual service card
│   │   ├── FilterButtons.jsx # Filter controls
│   │   ├── HowItWorks.jsx  # How it works section
│   │   ├── Footer.jsx      # Footer
│   │   ├── Modal.jsx       # Modal wrapper
│   │   ├── AuthForm.jsx    # Login/Register form
│   │   ├── BookingForm.jsx # Booking form
│   │   └── Dashboard.jsx   # User dashboard
│   ├── App.jsx             # Main App component
│   ├── App.css             # Global styles
│   └── index.css           # Base styles
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

## Setup

### Prerequisites
- Node.js 16+
- npm

### Installation

```bash
cd frontend
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

This will start the frontend on `http://localhost:5173` and proxy API calls to the backend at `http://localhost:3000`.

## Building

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview

Preview the production build locally:

```bash
npm run preview
```

## Features

- **Service Discovery**: Browse and filter freelance services
- **Authentication**: Register and sign in securely
- **Bookings**: Book services with preferred dates
- **Dashboard**: View your bookings and income insights
- **Responsive Design**: Works seamlessly on desktop and mobile

## API Integration

The frontend communicates with the backend API at:
- `/api/services` - Get list of services
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/bookings` - Create bookings
- `/api/dashboard` - Get user dashboard data
- `/api/me` - Get current user info

All API requests are automatically proxied through Vite during development.

## Technologies

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **CSS** - Custom styling (no CSS framework)
- **Fetch API** - HTTP client

## Notes

- The frontend connects to the Node.js backend. Ensure the backend is running on port 3000
- Development mode proxies `/api/*` requests to `http://localhost:3000`
- For production, configure your deployment server to proxy API calls appropriately

