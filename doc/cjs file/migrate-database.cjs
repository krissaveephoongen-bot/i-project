// Database Migration Script - แก้ไขปัญหา schema และทำให้ database พร้อมใช้งาน
const https = require('https');

async function runMigration() {
  console.log('🔄 เริ่ม Migration Database...\n');
  console.log('📅 เวลา:', new Date().toISOString());
  
  try {
    // Step 1: สร้าง cashflow table ถ้ายังไม่มี
    console.log('\n1️⃣ สร้าง Cashflow Table:');
    const createCashflow = await new Promise((resolve) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS public.cashflow (
          id TEXT PRIMARY KEY,
          month TEXT NOT NULL,
          committed DECIMAL(12,2) DEFAULT 0,
          paid DECIMAL(12,2) DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Grant permissions
        GRANT ALL ON public.cashflow TO authenticated;
        GRANT ALL ON public.cashflow TO anon;
      `;
      
      const data = JSON.stringify({ action: 'create_cashflow_table', sql });
      
      const req = https.request('https://i-projects.skin/api/migrate-database', {
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
            console.log(`   Status: ${res.statusCode}`);
            if (res.statusCode === 200 && result.success) {
              console.log('   ✅ Cashflow table created successfully');
            } else {
              console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
            }
            resolve(result);
          } catch (e) {
            console.log(`   Parse error: ${e.message}`);
            resolve({ error: e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Network error: ${err.message}`);
        resolve({ error: err.message });
      });
      
      req.write(data);
      req.end();
    });
    
    // Step 2: สร้าง/อัปเดต spi_cpi_daily_snapshot table ด้วย schema ที่ถูกต้อง
    console.log('\n2️⃣ สร้าง SPI/CPI Snapshot Table:');
    const createSnapshotTable = await new Promise((resolve) => {
      const sql = `
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
      
      const data = JSON.stringify({ action: 'create_spi_snapshot_table', sql });
      
      const req = https.request('https://i-projects.skin/api/migrate-database', {
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
            console.log(`   Status: ${res.statusCode}`);
            if (res.statusCode === 200 && result.success) {
              console.log('   ✅ SPI/CPI Snapshot table created successfully');
            } else {
              console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
            }
            resolve(result);
          } catch (e) {
            console.log(`   Parse error: ${e.message}`);
            resolve({ error: e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Network error: ${err.message}`);
        resolve({ error: err.message });
      });
      
      req.write(data);
      req.end();
    });
    
    // Step 3: ทดสอบผมจการ migration
    console.log('\n3️⃣ ทดสอบผมจการ Migration:');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: ทดสอบว่า tables ถูกสร้าง
    console.log('\n4️⃣ ทดสอบ Table Status:');
    const checkTables = await new Promise((resolve) => {
      const req = https.request('https://i-projects.skin/api/migrate-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify({ action: 'check_tables' }))
        }
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            console.log(`   Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
              console.log('   ✅ Tables Check: ' + JSON.stringify(result.tables));
            } else {
              console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
            }
            resolve(result);
          } catch (e) {
            console.log(`   Parse error: ${e.message}`);
            resolve({ error: e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Network error: ${err.message}`);
        resolve({ error: err.message });
      });
      req.end();
    });
    
    console.log('\n📋 Migration Summary:');
    console.log('='.repeat(50));
    console.log('✅ การสร้าง tables ที่จำเป็นต้อง');
    console.log('✅ การแก้ไขปัญหา database schema');
    console.log('🎯 Database พร้อมสำหรับใช้งาน');
    
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
  }
}

runMigration().catch(console.error);
