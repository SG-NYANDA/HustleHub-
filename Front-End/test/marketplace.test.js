import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server.js';

let origin;
let cookie;

test.before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
}
      );

test.after(() => server.close());

async function api(path, options = {}) {
  const response = await fetch(`${origin}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...options.headers } });
  const data = await response.json();
  return { response, data };
}
test('marketplace API protects and records the booking flow', async () => {
  const health = await api('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.data.ok, true);
  const catalogue = await api('/api/services');
  assert.equal(catalogue.data.services.length, 4);

  const registration = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: `test-${Date.now()}@example.com`, password: 'correct-horse-battery' }) });
  assert.equal(registration.response.status, 200);
  cookie = registration.response.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^hh_session=\w+$/);

  const booking = await api('/api/bookings', { method: 'POST', body: JSON.stringify({ serviceId: 's1', date: '2099-05-20', price: 1 }) });
  assert.equal(booking.response.status, 201);
  const dashboard = await api('/api/dashboard');
  assert.equal(dashboard.data.gross, 280);
  assert.equal(dashboard.data.tax, 70);
  assert.equal(dashboard.data.bookings.length, 1);

  const saved = cookie;
  cookie = undefined;
  const unauthenticatedBooking = await api('/api/bookings', { method: 'POST', body: JSON.stringify({ serviceId: 's1', date: '2099-05-20' }) });
  assert.equal(unauthenticatedBooking.response.status, 401);
  const unauthenticatedDashboard = await api('/api/dashboard');
  assert.equal(unauthenticatedDashboard.response.status, 401);
  cookie = saved;
});
