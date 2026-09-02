# HustleHub+ — Secure Backend (Part 1: Secure Foundations)

A secure freelance-marketplace API built with **Node.js + Express**, forming the
backend foundation of the MERN-stack HustleHub+ platform.

## 1. System overview

HustleHub+ allows **freelancers** to advertise services (gigs) and **clients** to
browse and book them. Bookings generate simulated financial transactions, and
freelancers can view income earned and estimated tax obligations. Because the
platform handles **user credentials, transactional records and income data**,
security is designed in from the start rather than added afterwards.

**Part 1 scope:** the secure API foundation — user registration, login, JWT
route protection, input validation, HTTPS and controlled error handling. Gigs,
bookings, transactions, tax calculations and the React dashboard follow in
Parts 2–3.

### Intended users

| Role | Description |
|------|-------------|
| **Client** | Browses and books gigs. |
| **Freelancer** | Creates and manages gigs; views income and estimated tax. |
| **Admin** | Oversees users and platform activity. |

## 2. Architecture (MERN)

docs/architecture.png

- **M — MongoDB** *(Part 2)*: will replace the in-memory store for users, gigs,
  bookings and transactions.
- **E — Express**: routing, middleware and the security pipeline.
- **R — React** *(Part 2)*: the SPA client that consumes this API over HTTPS.
- **N — Node.js**: the runtime hosting the Express server.

**System boundaries and security features:** an encrypted HTTPS boundary
separates the client tier from the server tier; a security-middleware pipeline
(Helmet + CSP, CORS, rate limiting, body-size limit, input validation) sits in
front of all routes; JWT and role-based access control guard protected
resources; a central error handler prevents information disclosure; and key
events are logged. The data tier is isolated behind the server tier.

## 3. Backend structure

```
backend/
├── server.js                      # Entry: HTTPS, Helmet, CORS, rate limit, routes
├── config/env.js                  # Loads and validates environment variables
├── routes/
│   ├── authRoutes.js              # /api/auth/register, /login, /me
│   └── gigRoutes.js               # /api/gigs (JWT + RBAC protected)
├── controllers/authController.js  # bcrypt hashing, JWT signing, login logic
├── middleware/
│   ├── validators.js              # express-validator rules + sanitisation
│   ├── authMiddleware.js          # requireAuth (JWT) + requireRole (RBAC)
│   └── errorHandler.js            # 404 + centralised safe error responses
├── data/userStore.js              # In-memory user store (Part 1 only)
├── utils/logger.js                # Event logging -> logs/app.log
├── postman/                       # Importable collection + environment
├── docs/architecture.png          # MERN architecture diagram
└── certs/                         # Local SSL certificate (git-ignored)
```

**Request flow:** `HTTPS → Helmet/CORS/rate-limit → JSON parse → validation →
route → controller → (JWT middleware on protected routes) → response`. Any error
is funnelled to the central error handler.

## 4. Security decisions

### 4.1 Password hashing
Passwords are **never stored in plain text**. On registration the password is
hashed using **bcrypt** with a configurable cost factor (`BCRYPT_SALT_ROUNDS`,
default **12**). bcrypt automatically generates a unique random **salt** for each
password and embeds it in the resulting hash, which defeats rainbow-table and
precomputation attacks — identical passwords produce different hashes. On login,
`bcrypt.compare()` re-hashes the submitted password and compares it to the
stored value; the algorithm is deliberately slow to resist brute-force attacks.
Only the hash is persisted, and it is never included in any API response.

### 4.2 Token-based authentication (JWT)
Successful registration or login returns a **JSON Web Token** signed with
`JWT_SECRET` and given an expiry (`JWT_EXPIRES_IN`, default **1 hour**). The
payload contains only the **user id** and **role** — no sensitive data. Clients
send the token as `Authorization: Bearer <token>`. The `requireAuth` middleware
verifies the signature and expiry on every protected request, and `requireRole`
enforces role-based access control. This keeps the API **stateless** (no
server-side sessions). `/api/auth/me` and `/api/gigs` demonstrate that JWT
protects routes beyond registration and login.

### 4.3 Input validation and sanitisation
All input is validated **before** any controller logic runs, using
**express-validator**. Names are length-checked and HTML-escaped (mitigating
stored XSS), emails are validated and normalised, and passwords must meet a
strength policy (minimum 8 characters with upper case, lower case and a number).
The `role` field is whitelisted to `client` or `freelancer` so a user cannot
self-assign elevated privileges. Invalid input returns a clean **400** response
with per-field messages and is never processed.

### 4.4 HTTPS
The API is served over **HTTPS** using a locally generated self-signed SSL
certificate. All traffic — including credentials and tokens — is therefore
encrypted in transit, protecting against eavesdropping and man-in-the-middle
attacks. HTTPS is enabled via `USE_HTTPS=true`. The browser displays a warning
because the certificate is self-signed rather than issued by a trusted
Certificate Authority; the traffic is still encrypted, but the server's identity
cannot be verified. In production a CA-issued certificate would be used.

### 4.5 Controlled error handling
A centralised error handler returns **generic messages** and never exposes stack
traces, file paths or configuration values. Full details are written to the
server-side log only. Login failures return an identical
`Invalid email or password` message for both an unknown email and an incorrect
password, preventing **user enumeration**.

### 4.6 Defence in depth
- **Helmet** sets secure HTTP headers including a strict Content Security Policy.
- **CORS** restricts requests to the configured frontend origin.
- **Rate limiting** on `/api/auth/*` blunts brute-force attempts.
- **Body-size limit** (10 kb) rejects oversized payloads.
- **`x-powered-by` disabled** so the technology stack is not advertised.
- **Event logging** records registrations, logins, failed attempts and token errors — never passwords or tokens.

## 5. Getting started

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# open .env and set a strong JWT_SECRET
```

### Generate the local SSL certificate
From the `backend` folder (use **Git Bash** on Windows):

```bash
mkdir certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
  -keyout certs/localhost-key.pem \
  -out certs/localhost-cert.pem \
  -subj "//CN=localhost"
```

Then start the server:

```bash
npm start                 # https://localhost:5000
```

Health check: `https://localhost:5000/health` → `{ "status": "OK", "protocol": "HTTPS" }`
(accept the self-signed-certificate warning).

## 6. API reference

| Method | Route | Auth | Body | Success |
|--------|-------|------|------|---------|
| GET | `/health` | – | – | 200 |
| POST | `/api/auth/register` | – | name, email, password, role? | 201 + token |
| POST | `/api/auth/login` | – | email, password | 200 + token |
| GET | `/api/auth/me` | Bearer | – | 200 (profile) |
| GET | `/api/gigs` | Bearer | – | 200 |
| POST | `/api/gigs` | Bearer (freelancer) | – | 201 |

Example response (note that `passwordHash` is never returned):

```json
{
  "message": "Login successful",
  "user": { "id": "…", "name": "…", "email": "…", "role": "freelancer" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
}
```

## 7. Testing with Postman

1. Import both files from `postman/`.
2. Select the **HustleHub Local** environment.
3. Disable SSL verification: **Settings ⚙ → General → SSL certificate verification → OFF**
   (required because the certificate is self-signed).
4. Run the collection. It covers valid registration and login, protected-route
   access with a token, and invalid scenarios: duplicate email (409), invalid
   input (400), wrong password (401) and missing token (401).

   https://drive.google.com/file/d/1y2pxmgzcaNNCeSOs0njP7pPBZ69VCoaM/view?usp=sharing

Screenshots of these responses are included in the submission.

## 8. Demonstration video

**Video link:** <paste your link here>
