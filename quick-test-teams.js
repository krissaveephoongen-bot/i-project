const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkZmMyZTFiLTBkNWYtNDBlMi05OWNhLTA3MjFlYTVlYzhjYyIsImVtYWlsIjoiamFrZ3JpdHMucGhAYXBwd29ya3MuY28udGgiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiSmFrZ3JpdHMgUGhvb25nZW4iLCJpYXQiOjE3NzE3NjI3NDksImV4cCI6MTc3MTg0OTE0OX0.0Nt9vwGLszvL3u4BYJhLGWw0Sg8_s6H6xq7r-f5VaD8'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    console.log('Testing /api/teams...');
    const result = await makeRequest('/api/teams');
    console.log('Status:', result.status);
    console.log('Body:', result.body);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
