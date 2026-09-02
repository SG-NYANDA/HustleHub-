# HustleHub+ — Secure Backend (Part 1: Secure Foundations)

A secure freelance-marketplace API built with **Node.js + Express**, forming the
backend foundation of the MERN-stack HustleHub+ platform.

## 1. System overview

HustleHub+ allows **freelancers** to advertise services (gigs) and **clients** to
browse and book them. Bookings will generate financial transactions, and
freelancers will be able to view income earned and estimated tax obligations.
Because the platform will eventually handle **user credentials, transactional
records and income data**, security is designed in from the start rather than
added afterwards.

**Part 1 scope:** the secure API foundation — user registration, login, JWT
route protection, input validation, HTTPS and controlled error handling. Gigs,
bookings, transactions, tax calculations and the React dashboard follow in later
parts of the POE and are not implemented yet.

### Intended users

| Role | Description |
|------|-------------|
| **Client** | Will browse and book gigs (later parts). |
| **Freelancer** | Will create and manage gigs; view income and estimated tax (later parts). |

Both roles currently register and log in through the same endpoints, distinguished
only by the `role` field on their account.

## 2. Architecture (MERN)

- **M — MongoDB** *(later part)*: will replace the current file-based store for
  users, and later for gigs, bookings and transactions.
- **E — Express**: routing, middleware and the security pipeline.
- **R — React** *(later part)*: the SPA client that will consume this API over HTTPS.
- **N — Node.js**: the runtime hosting the Express server.

**System boundaries and security features:** an encrypted HTTPS boundary
separates the client from the server; a security-middleware pipeline (Helmet,
CORS, rate limiting, body-size limit, input validation) sits in front of every
route; JWT guards protected resources; a central error handler prevents
information disclosure. The data layer (currently a JSON file) is only ever
accessed through the `userStore` module, so it can be swapped for a real
database later without touching any other part of the code.

## 3. Backend structure

```
backend/
├── src/
│   ├── app.js                     # Express app: middleware + route wiring
│   ├── server.js                  # Entry point: starts HTTPS (or HTTP fallback)
│   ├── config/
│   │   └── env.js                 # Loads and validates environment variables
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/register, /api/auth/login
│   │   └── userRoutes.js          # /api/users/me (protected)
│   ├── controllers/
│   │   └── authController.js      # register, login, getCurrentUser logic
│   ├── middleware/
│   │   ├── validators.js          # express-validator rules + sanitisation
│   │   ├── authenticate.js        # JWT verification for protected routes
│   │   ├── errorHandler.js        # centralised safe error responses + 404
│   │   └── rateLimiter.js         # rate limiting on auth routes
│   ├── models/
│   │   └── userStore.js           # file-based user store (Part 1 only)
│   ├── utils/
│   │   ├── AppError.js            # operational error class
│   │   ├── password.js            # bcrypt hashing/comparison
│   │   └── token.js               # JWT sign/verify
│   └── data/
│       └── users.json             # runtime data file (gitignored)
├── scripts/
│   └── generateCert.js            # generates a local self-signed SSL certificate
├── certs/                         # generated cert lives here (gitignored)
├── .env.example
└── package.json
```

**Request flow:** `HTTPS → Helmet/CORS/rate-limit → JSON parse → validation →
route → controller → (JWT middleware on protected routes) → response`. Any error
is funnelled to the central error handler.

## 4. Security decisions

### 4.1 Password hashing
Passwords are **never stored in plain text**. On registration the password is
hashed using **bcrypt** with a cost factor of **12 salt rounds**, set directly in
`utils/password.js`. bcrypt automatically generates a unique random salt for each
password and embeds it in the resulting hash, which defeats rainbow-table and
precomputation attacks — identical passwords produce different hashes. On login,
`bcrypt.compare()` checks the submitted password against the stored hash; the
algorithm is deliberately slow to resist brute-force attacks. Only the hash is
persisted, and it is never included in any API response.

### 4.2 Token-based authentication (JWT)
Successful registration or login returns a **JSON Web Token** signed with
`JWT_SECRET` and given an expiry (`JWT_EXPIRES_IN`, default **1 hour**). The
payload contains only the **user id** and **role** — no sensitive data. Clients
send the token as `Authorization: Bearer <token>`. The `authenticate` middleware
verifies the signature and expiry on every protected request. This keeps the API
**stateless** — there is no server-side session, the token itself is the proof.
`GET /api/users/me` demonstrates that JWT protects routes beyond registration
and login.

### 4.3 Input validation and sanitisation
All input is validated **before** any controller logic runs, using
**express-validator**. Names are length-checked and HTML-escaped (mitigating
stored XSS), emails are validated and normalised, and passwords must be at least
8 characters with an uppercase letter and a number. The `role` field is
whitelisted to `client` or `freelancer` so a user cannot self-assign an
arbitrary role. Invalid input returns a clean **422** response with per-field
messages and is never processed further.

### 4.4 HTTPS
The API is served over **HTTPS** using a locally generated self-signed SSL
certificate (created via `npm run gen-cert`, using the `selfsigned` npm
package — no OpenSSL CLI installation required). All traffic, including
credentials and tokens, is encrypted in transit. HTTPS is enabled via
`USE_HTTPS=true` in `.env`; if no certificate is found, the server falls back
to plain HTTP with a console warning so it's still runnable, but the intended
and graded run mode is HTTPS. The browser shows a trust warning because the
certificate is self-signed rather than issued by a public Certificate
Authority — the connection is still encrypted, but the server's identity can't
be verified by a third party. In production a CA-issued certificate would be
used instead.

### 4.5 Controlled error handling
A centralised error handler (`middleware/errorHandler.js`) returns **generic
messages** and never exposes stack traces, file paths or configuration values,
in any environment. Login failures return an identical `Invalid email or
password` message whether the email doesn't exist or the password is wrong,
preventing **user enumeration**. Oversized request bodies are also caught here
and rejected with a clear, specific message rather than a vague failure.

### 4.6 Defence in depth
- **Helmet** sets secure HTTP headers automatically (including disabling
  `X-Powered-By` so the technology stack isn't advertised).
- **CORS** restricts requests to the configured frontend origin rather than
  allowing any origin.
- **Rate limiting** on `/api/auth/*` (20 requests / 15 minutes / IP) blunts
  brute-force and credential-stuffing attempts.
- **Body-size limit** (10 kb) rejects oversized payloads before they're parsed.
- The server **refuses to start** if `JWT_SECRET` is missing or left as the
  placeholder value from `.env.example`, so it can't accidentally run
  insecurely.

## 5. Getting started

Requires Node.js 18+.

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to a long, random string — the server will
refuse to start if it's left as the placeholder value.

Generate the local SSL certificate:

```bash
npm run gen-cert
```

Then start the server:

```bash
npm start
```

If everything's fine you'll see:

```
HustleHub+ API listening securely on https://localhost:5443
```

Health check: `https://localhost:5443/api/health` → `{"success": true, "message": "HustleHub+ API is running."}`
(you'll need to accept the self-signed certificate warning in your browser).

## 6. API reference

| Method | Route | Auth | Body | Success |
|--------|-------|------|------|---------|
| GET | `/api/health` | – | – | 200 |
| POST | `/api/auth/register` | – | name, email, password, role | 201 + token |
| POST | `/api/auth/login` | – | email, password | 200 + token |
| GET | `/api/users/me` | Bearer | – | 200 (profile) |

Example response (note that `passwordHash` is never returned):

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": "…", "name": "…", "email": "…", "role": "freelancer", "createdAt": "…" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
  }
}
```

## 7. Testing with Postman

1. Import `postman/HustleHub-Auth.postman_collection.json`.
2. Disable SSL verification: **Settings ⚙ → General → SSL certificate
   verification → OFF** (required because the certificate is self-signed).
3. Make sure the server is running (`npm start`) before running the collection.
4. Run the collection. It covers valid registration and login, protected-route
   access with and without a token, and invalid scenarios: duplicate email
   (409), missing fields (422), malicious/script-injection input (201,
   sanitised), weak password and invalid role (422), wrong password (401), and
   an oversized payload (413).

Screenshots of these responses are included in the submission evidence document.

## 8. Demonstration video

**Video link:** https://drive.google.com/file/d/1y2pxmgzcaNNCeSOs0njP7pPBZ69VCoaM/view?usp=sharing
