# HustleHub+

A secure, dependency-light freelance marketplace prototype. It supports service discovery, account registration/sign-in, authenticated bookings, transaction recording, and an income snapshot with a configurable 25% estimated tax reserve.

## Run

Requires Node.js 20+.

```bash
npm start
```

Open http://localhost:3000.

## Test

```bash
npm test
```

## Security notes

- Passwords are hashed with Node's `scrypt` and compared with `timingSafeEqual`.
- Sessions use cryptographically random opaque tokens stored server-side and sent as `HttpOnly`, `SameSite=Strict` cookies.
- API responses include CSP, frame, MIME sniffing, referrer, and permissions policies.
- Requests are rate-limited by source address and user input is length/type validated.
- Booking totals come from the server-side service catalogue; client-submitted prices are ignored.

This prototype stores data in memory for local development. Production deployment should replace the maps with a durable database, use a shared session store, add CSRF protection for cookie-authenticated state changes, use TLS, audit logging, payment-provider webhooks, and a jurisdiction-specific tax configuration.
