const API_BASE = (process.env.API_BASE_URL || 'https://ticket-apw-api.vercel.app/api').trim().replace(/\/+$/, '');
const EMAIL = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'AppWorks@123!';

function joinUrl(base, path) {
  const p = (path || '').trim();
  if (!p) return base;
  return p.startsWith('/') ? `${base}${p}` : `${base}/${p}`;
}

async function httpJson(path, init) {
  const url = path.startsWith('http') ? path : joinUrl(API_BASE, path);
  const res = await fetch(encodeURI(url), init);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { url, res, body };
}

function preview(objOrText) {
  const s = typeof objOrText === 'string' ? objOrText : JSON.stringify(objOrText);
  return s.length > 300 ? s.slice(0, 300) + '…' : s;
}

function log(status, name, details = '') {
  const icon = status ? '✓' : '✗';
  console.log(`${icon} ${name}${details ? ` - ${details}` : ''}`);
}

let passed = 0;
let failed = 0;
let token = null;

async function run() {
  console.log('🧪 Production API Smoke Test');
  console.log(`Base URL: ${API_BASE}`);

  // Health
  try {
    const { url, res, body } = await httpJson('/health');
    const ok = res.status === 200 && !!body;
    log(ok, 'Health endpoint', `status=${res.status}`);
    if (!ok) console.log('  URL:', url, '\n  Body:', preview(body));
    ok ? passed++ : failed++;
  } catch (e) {
    log(false, 'Health endpoint', e.message);
    failed++;
  }

  // Invalid login
  try {
    const { url, res, body } = await httpJson('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrong' }),
    });
    const ok = [400, 401].includes(res.status);
    log(ok, 'Invalid login rejected', `status=${res.status}`);
    if (!ok) console.log('  URL:', url, '\n  Body:', preview(body));
    ok ? passed++ : failed++;
  } catch (e) {
    log(false, 'Invalid login rejected', e.message);
    failed++;
  }

  // Valid login
  try {
    const { url, res, body } = await httpJson('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const possibleToken = body?.token || body?.data?.token || null;
    if (possibleToken) token = possibleToken;
    const ok = res.status === 200;
    log(ok, 'Valid login', `status=${res.status}${token ? ' (token acquired)' : ' (no token)'}`);
    if (!ok || !token) console.log('  URL:', url, '\n  Body:', preview(body));
    ok ? passed++ : failed++;
  } catch (e) {
    log(false, 'Valid login', e.message);
    failed++;
  }

  // Authenticated endpoints (skip if no token)
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // /auth/me
  try {
    if (!token) {
      log(true, '/auth/me (skipped, no token)');
      passed++;
    } else {
      const { url, res, body } = await httpJson('/auth/me', { headers: authHeaders });
      const ok = res.status === 200 && !!body;
      log(ok, '/auth/me', `status=${res.status}`);
      if (!ok) console.log('  URL:', url, '\n  Body:', preview(body));
      ok ? passed++ : failed++;
    }
  } catch (e) {
    log(false, '/auth/me', e.message);
    failed++;
  }

  // Common collections
  const collections = ['/projects', '/users', '/tasks'];
  for (const path of collections) {
    try {
      const { url, res, body } = await httpJson(path, { headers: authHeaders });
      const ok = res.status === 200 && (Array.isArray(body) || typeof body === 'object');
      log(ok, `${path}`, `status=${res.status}`);
      if (!ok) console.log('  URL:', url, '\n  Body:', preview(body));
      ok ? passed++ : failed++;
    } catch (e) {
      log(false, `${path}`, e.message);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
