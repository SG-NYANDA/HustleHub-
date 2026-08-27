import http from 'node:http';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scrypt = promisify(scryptCallback);
const root = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(root, 'public');
const port = Number(process.env.PORT || 3000);
const sessions = new Map();
const users = new Map();
const services = [
  { id: 's1', title: 'Brand identity that feels unmistakably yours', category: 'Design', price: 280, duration: '5 days', rating: 4.9, reviews: 38, freelancer: 'Maya Chen', initials: 'MC', accent: 'coral', blurb: 'A thoughtful logo system, type pairing, and a mini brand guide for growing teams.' },
  { id: 's2', title: 'A launch-ready website with real momentum', category: 'Development', price: 650, duration: '10 days', rating: 5.0, reviews: 21, freelancer: 'Jordan Bell', initials: 'JB', accent: 'mint', blurb: 'Fast, accessible landing pages that turn curious visitors into confident customers.' },
  { id: 's3', title: 'Social content that sounds like a person', category: 'Writing', price: 190, duration: '4 days', rating: 4.8, reviews: 56, freelancer: 'Nia Okafor', initials: 'NO', accent: 'sun', blurb: 'A month of sharp captions and content ideas, tuned to your voice and audience.' },
  { id: 's4', title: 'Make your numbers tell a clearer story', category: 'Strategy', price: 340, duration: '3 days', rating: 4.9, reviews: 14, freelancer: 'Theo Martin', initials: 'TM', accent: 'blue', blurb: 'A practical financial dashboard and a calm, clear plan for your next decision.' }
];
const bookings = [];
const transactions = [];
const attempts = new Map();

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return scrypt(password, salt, 64).then(key => `${salt}:${key.toString('hex')}`);
}
async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}
function json(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...extra });
  res.end(JSON.stringify(body));
}
function securityHeaders(res) {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}
function body(req) {
  return new Promise((resolve, reject) => { let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 100_000) req.destroy(); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } }); req.on('error', reject); });
}
function clean(value, max = 120) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
function rateLimited(req) {
  const address = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(address) || []).filter(time => now - time < 60_000);
  recent.push(now); attempts.set(address, recent);
  return recent.length > 60;
}
function currentUser(req) {
  const token = req.headers.cookie?.match(/hh_session=([^;]+)/)?.[1];
  const userId = token && sessions.get(token);
  return userId ? users.get(userId) : null;
}
function requireUser(req, res) { const user = currentUser(req); if (!user) json(res, 401, { error: 'Sign in required' }); return user; }

async function route(req, res) {
  securityHeaders(res);
  if (rateLimited(req)) return json(res, 429, { error: 'Too many requests. Try again shortly.' });
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true });
  if (req.method === 'GET' && url.pathname === '/api/services') return json(res, 200, { services });
  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    try {
      const input = await body(req); const email = clean(input.email, 160).toLowerCase(); const password = typeof input.password === 'string' ? input.password : '';
      if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10) return json(res, 400, { error: 'Use a valid email and a password of at least 10 characters.' });
      if ([...users.values()].some(user => user.email === email)) return json(res, 409, { error: 'An account with that email already exists.' });
      const user = { id: randomUUID(), email, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() }; users.set(user.id, user);
      return login(res, user);
    } catch { return json(res, 400, { error: 'Invalid request.' }); }
  }
  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    try { const input = await body(req); const email = clean(input.email, 160).toLowerCase(); const user = [...users.values()].find(item => item.email === email); if (!user || !(await verifyPassword(input.password || '', user.passwordHash))) return json(res, 401, { error: 'Email or password is incorrect.' }); return login(res, user); } catch { return json(res, 400, { error: 'Invalid request.' }); }
  }
  if (req.method === 'POST' && url.pathname === '/api/auth/logout') { const token = req.headers.cookie?.match(/hh_session=([^;]+)/)?.[1]; if (token) sessions.delete(token); return json(res, 200, { ok: true }, { 'Set-Cookie': 'hh_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }); }
  if (req.method === 'GET' && url.pathname === '/api/me') { const user = currentUser(req); return json(res, 200, { user: user ? { email: user.email } : null }); }
  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    const user = requireUser(req, res); if (!user) return; const own = transactions.filter(item => item.userId === user.id); const gross = own.reduce((sum, item) => sum + item.amount, 0); return json(res, 200, { gross, tax: Math.round(gross * 0.25), available: Math.round(gross * 0.75), bookings: bookings.filter(item => item.userId === user.id) });
  }
  if (req.method === 'POST' && url.pathname === '/api/bookings') {
    const user = requireUser(req, res); if (!user) return;
    try { const input = await body(req); const service = services.find(item => item.id === input.serviceId); if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return json(res, 400, { error: 'Choose a service and a valid date.' }); const booking = { id: randomUUID(), userId: user.id, serviceId: service.id, title: service.title, freelancer: service.freelancer, date: input.date, status: 'Confirmed' }; bookings.push(booking); transactions.push({ id: randomUUID(), userId: user.id, amount: service.price, bookingId: booking.id }); return json(res, 201, { booking }); } catch { return json(res, 400, { error: 'Invalid request.' }); }
  }
  if (req.method === 'GET') { const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); if (file.includes('..')) return json(res, 400, { error: 'Invalid path' }); try { const content = await readFile(join(publicDir, file)); const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }; res.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8` }); return res.end(content); } catch { return json(res, 404, { error: 'Not found' }); } }
  return json(res, 404, { error: 'Not found' });
}
function login(res, user) { const token = randomBytes(32).toString('hex'); sessions.set(token, user.id); json(res, 200, { user: { email: user.email } }, { 'Set-Cookie': `hh_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400` }); }
const server = http.createServer((req, res) => route(req, res).catch(() => json(res, 500, { error: 'Something went wrong.' })));
if (process.argv[1] === fileURLToPath(import.meta.url)) server.listen(port, () => console.log(`HustleHub+ running at http://localhost:${port}`));
export { server, hashPassword, verifyPassword };
