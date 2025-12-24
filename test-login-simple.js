const https = require('http');

const postData = JSON.stringify({
  email: 'jakgrits.ph@appworks.co.th',
  password: 'AppWorks@123!'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔐 Testing login...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('\nResponse:\n');
    
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n✅ LOGIN SUCCESSFUL!\n');
        console.log('User:', result.user.name);
        console.log('Email:', result.user.email);
        console.log('Role:', result.user.role);
        console.log('\nToken:', result.token.substring(0, 30) + '...');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('\nMake sure to run: npm run server');
});

req.write(postData);
req.end();

setTimeout(() => {
  console.log('\n⏱️  Test completed');
  process.exit(0);
}, 3000);
