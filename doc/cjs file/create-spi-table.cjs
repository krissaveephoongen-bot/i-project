// Create the spi_cpi_daily_snapshot table with correct schema
const https = require('https');

async function createSPITable() {
  console.log('🔧 Creating SPI/CPI Daily Snapshot table...\n');
  
  // SQL to create the table with correct column names
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS spi_cpi_daily_snapshot (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      date TEXT NOT NULL,
      spi DECIMAL(5,2) DEFAULT 1.0,
      cpi DECIMAL(5,2) DEFAULT 1.0,
      budget DECIMAL(12,2) DEFAULT 0,
      spent DECIMAL(12,2) DEFAULT 0,
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  console.log('📝 SQL:', createTableSQL);
  
  try {
    const response = await new Promise((resolve) => {
      const data = JSON.stringify({
        sql: createTableSQL
      });
      
      const req = https.request('https://i-projects.skin/api/exec-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Result: ${JSON.stringify(result)}`);
            resolve(result);
          } catch (e) {
            console.log(`Parse error: ${e.message}`);
            resolve({ error: e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`Network error: ${err.message}`);
        resolve({ error: err.message });
      });
      
      req.write(data);
      req.end();
    });
    
    if (response.error) {
      console.log('❌ Table creation failed:', response.error);
    } else {
      console.log('✅ Table created successfully');
    }
    
  } catch (e) {
    console.log('❌ Request failed:', e.message);
  }
}

createSPITable().catch(console.error);
