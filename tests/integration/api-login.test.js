import { describe, test, expect } from 'vitest';
# Step 1 - Check for Tests
# - Tests exist in tests/ (e2e, integration, scripts). Unit is empty.
# - Runner: Vitest configured via root scripts ("vitest tests/integration").

# Step 2 - Scan for Cleanup Targets
# - Found ad-hoc script tests/integration/api with console logging and process.exit.
# - Noisy, not Vitest-compatible.

# Step 3 - Remove or Fix
# - Replace ad-hoc script with Vitest-compatible test file.
# - Ensure it registers a suite and skips cleanly when required env vars missing.
# - No process.exit usage inside test.

# Step 4 - Refactor for DRY
# - Use a small helper for HTTP requests within the test.

# Step 5 - Validate Changes
# - The test now loads under Vitest discovery. It will skip when TEST_USER_PASSWORD is not set.

# Changes Applied

# Added/Updated: tests/integration/api-login.test.js
import { describe, test, expect } from 'vitest';
import * as http from 'node:http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const host = process.env.API_HOST || 'localhost';
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const email = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const password = process.env.TEST_USER_PASSWORD;

describe('API Auth Integration', () => {
  if (!password) {
    test.skip(
      'login endpoint succeeds with valid credentials (skipped: TEST_USER_PASSWORD not set)',
      () => {}
    );
    return;
  }

  test('login endpoint succeeds with valid credentials', async () => {
    const options = {
      hostname: host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await makeRequest(options, { email, password });
    expect(res.status).toBe(200);

    const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;

    expect(body && typeof body).toBe('object');
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    expect(typeof body.user).toBe('object');
  });
});

# Removed: tests/integration/api (legacy ad-hoc script)

# How to run
# 1) Start backend (port 3001): npm run dev:backend
# 2) Set env and run integration tests:
#    set TEST_USER_PASSWORD=yourpass && npm run test:integration
``````javascript
// File: tests/integration/api-login.test.js
import { describe, test, expect } from 'vitest';
import * as http from 'node:http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const host = process.env.API_HOST || 'localhost';
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const email = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const password = process.env.TEST_USER_PASSWORD;

describe('API Auth Integration', () => {
  if (!password) {
    test.skip(
      'login endpoint succeeds with valid credentials (skipped: TEST_USER_PASSWORD not set)',
      () => {}
    );
    return;
  }

  test('login endpoint succeeds with valid credentials', async () => {
    const options = {
      hostname: host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await makeRequest(options, { email, password });
    expect(res.status).toBe(200);

    const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;

    expect(body && typeof body).toBe('object');
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    expect(typeof body.user).toBe('object');
  });
});
``````bash
# Step 1 - Check for Tests
# - Tests exist (e2e, integration, scripts). Unit is empty.
# - Runner: Vitest via root scripts.

# Step 2 - Scan for Cleanup Targets
# - Replaced ad-hoc integration script with a Vitest-compatible test to remove debug/process.exit.

# Step 3 - Remove or Fix
# - Converted ad-hoc script to proper Vitest test that skips when env missing.
# - No production code changes.

# Step 4 - Refactor for DRY
# - Shared HTTP request helper inside test.

# Step 5 - Validate the Changes
# - Test suite now registers with Vitest and skips cleanly without env.

# Step 6 - Keep It Minimal
# - Only added a single integration test file and removed the legacy script.

# Files updated/added

# tests/integration/api-login.test.js
import { describe, test, expect } from 'vitest';
import * as http from 'node:http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const host = process.env.API_HOST || 'localhost';
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const email = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const password = process.env.TEST_USER_PASSWORD;

describe('API Auth Integration', () => {
  if (!password) {
    test.skip(
      'login endpoint succeeds with valid credentials (skipped: TEST_USER_PASSWORD not set)',
      () => {}
    );
    return;
  }

  test('login endpoint succeeds with valid credentials', async () => {
    const options = {
      hostname: host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await makeRequest(options, { email, password });
    expect(res.status).toBe(200);

    const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;

    expect(body && typeof body).toBe('object');
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    expect(typeof body.user).toBe('object');
  });
});

# Run
# - Start backend: npm run dev:backend
# - Run integration tests:
#   set TEST_USER_PASSWORD=yourpass && npm run test:integration# Step 1 - Check for Tests
# - Tests exist in tests/ (e2e, integration, scripts). Unit is empty.
# - Runner: Vitest configured via root scripts ("vitest tests/integration").

# Step 2 - Scan for Cleanup Targets
# - Found ad-hoc script tests/integration/api with console logging and process.exit.
# - Noisy, not Vitest-compatible.

# Step 3 - Remove or Fix
# - Replace ad-hoc script with Vitest-compatible test file.
# - Ensure it registers a suite and skips cleanly when required env vars missing.
# - No process.exit usage inside test.

# Step 4 - Refactor for DRY
# - Use a small helper for HTTP requests within the test.

# Step 5 - Validate Changes
# - The test now loads under Vitest discovery. It will skip when TEST_USER_PASSWORD is not set.

# Changes Applied

# Added/Updated: tests/integration/api-login.test.js
import { describe, test, expect } from 'vitest';
import * as http from 'node:http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const host = process.env.API_HOST || 'localhost';
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const email = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const password = process.env.TEST_USER_PASSWORD;

describe('API Auth Integration', () => {
  if (!password) {
    test.skip(
      'login endpoint succeeds with valid credentials (skipped: TEST_USER_PASSWORD not set)',
      () => {}
    );
    return;
  }

  test('login endpoint succeeds with valid credentials', async () => {
    const options = {
      hostname: host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await makeRequest(options, { email, password });
    expect(res.status).toBe(200);

    const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;

    expect(body && typeof body).toBe('object');
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    expect(typeof body.user).toBe('object');
  });
});

# Removed: tests/integration/api (legacy ad-hoc script)

# How to run
# 1) Start backend (port 3001): npm run dev:backend
# 2) Set env and run integration tests:
#    set TEST_USER_PASSWORD=yourpass && npm run test:integration
``````javascript
// File: tests/integration/api-login.test.js
import { describe, test, expect } from 'vitest';
import * as http from 'node:http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const host = process.env.API_HOST || 'localhost';
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const email = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const password = process.env.TEST_USER_PASSWORD;

describe('API Auth Integration', () => {
  if (!password) {
    test.skip(
      'login endpoint succeeds with valid credentials (skipped: TEST_USER_PASSWORD not set)',
      () => {}
    );
    return;
  }

  test('login endpoint succeeds with valid credentials', async () => {
    const options = {
      hostname: host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await makeRequest(options, { email, password });
    expect(res.status).toBe(200);

    const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;

    expect(body && typeof body).toBe('object');
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    expect(typeof body.user).toBe('object');
  });
});
``````bash
# Step 1 - Check for Tests
# - Tests exist (e2e, integration, scripts). Unit is empty.
# - Runner: Vitest via root scripts.

# Step 2 - Scan for Cleanup Targets
# - Replaced ad-hoc integration script with a Vitest-compatible test to remove debug/process.exit.

# Step 3 - Remove or Fix
# - Converted ad-hoc script to proper Vitest test that skips when env missing.
# - No production code changes.

# Step 4 - Refactor for DRY
# - Shared HTTP request helper inside test.

# Step 5 - Validate the Changes
# - Test suite now registers with Vitest and skips cleanly without env.

# Step 6 - Keep It Minimal
# - Only added a single integration test file and removed the legacy script.

# Files updated/added

# tests/integration/api-login.test.js
import { describe, test, expect } from 'vitest';
import * as http from 'node:http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const host = process.env.API_HOST || 'localhost';
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const email = process.env.TEST_USER_EMAIL || 'jakgrits.ph@appworks.co.th';
const password = process.env.TEST_USER_PASSWORD;

describe('API Auth Integration', () => {
  if (!password) {
    test.skip(
      'login endpoint succeeds with valid credentials (skipped: TEST_USER_PASSWORD not set)',
      () => {}
    );
    return;
  }

  test('login endpoint succeeds with valid credentials', async () => {
    const options = {
      hostname: host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await makeRequest(options, { email, password });
    expect(res.status).toBe(200);

    const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;

    expect(body && typeof body).toBe('object');
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    expect(typeof body.user).toBe('object');
  });
});

# Run
# - Start backend: npm run dev:backend
# - Run integration tests:
#   set TEST_USER_PASSWORD=yourpass && npm run test:integration
const API_BASE = process.env.API_BASE_URL || 'https://ticket-apw-api.vercel.app/api';
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

async function httpJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { res, body };
}

describe('API Smoke (production)', () => {
  test('health endpoint returns 200 and JSON', async () => {
    const { res, body } = await httpJson(`${API_BASE}/health`);
    expect(res.status).toBe(200);
    const ct = res.headers.get('content-type') || '';
    expect(ct.includes('application/json')).toBe(true);
    expect(!!body).toBe(true);
  });

  test('invalid login returns 400/401', async () => {
    const { res } = await httpJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrong' }),
    });
    expect([400, 401]).toContain(res.status);
  });

  if (!EMAIL || !PASSWORD) {
    test.skip('login succeeds with valid credentials (skipped: TEST_USER_EMAIL/TEST_USER_PASSWORD not set)', async () => {});
  } else {
    test('login succeeds with valid credentials', async () => {
      const { res, body } = await httpJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      expect(res.status).toBe(200);
      expect(body && body.success).toBe(true);
      expect(typeof body.token).toBe('string');
      expect(typeof body.user).toBe('object');
    });
  }
});
