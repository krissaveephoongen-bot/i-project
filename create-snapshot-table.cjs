// Create the missing spi_cpi_daily_snapshot table
const https = require('https');

async function createSnapshotTable() {
  console.log('🔧 Creating spi_cpi_daily_snapshot table...\n');
  
  // SQL to create the table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.spi_cpi_daily_snapshot (
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
    
    -- Grant permissions
    GRANT ALL ON public.spi_cpi_daily_snapshot TO authenticated;
    GRANT ALL ON public.spi_cpi_daily_snapshot TO anon;
  `;
  
  console.log('📝 Executing SQL to create table...');
  console.log(createTableSQL);
  
  try {
    // Try to execute via a simple POST request
    const response = await new Promise((resolve) => {
      const data = JSON.stringify({
        action: 'create_table',
        sql: createTableSQL
      });
      
      const req = https.request('https://i-projects.skin/api/admin/create-table', {
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
      
      // Now test SPI/CPI snapshot
      console.log('\n🔄 Testing SPI/CPI snapshot after table creation...');
      await testSnapshotAPI();
    }
    
  } catch (e) {
    console.log('❌ Request failed:', e.message);
  }
}

async function testSnapshotAPI() {
  try {
    const snapshot = await new Promise((resolve) => {
      const req = https.request('https://i-projects.skin/api/jobs/spi-cpi-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Success: ${parsed.ok}`);
            if (parsed.ok) {
              console.log('   ✅ SPI/CPI Snapshot: NOW WORKING!');
              console.log(`   📊 Created: ${parsed.count} snapshots`);
            } else {
              console.log(`   ❌ Still failing: ${parsed.error}`);
            }
            resolve(parsed);
          } catch (e) {
            console.log(`   Parse error: ${e.message}`);
            resolve(null);
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Network error: ${err.message}`);
        resolve(null);
      });
      req.end();
    });
    
    return snapshot;
  } catch (e) {
    console.log('❌ Snapshot test failed:', e.message);
    return null;
  }
}

createSnapshotTable().catch(console.error);
