// Test MCP Supabase connection
const { spawn } = require('child_process');
const fs = require('fs');

async function testMCPSupabase() {
  console.log('🔍 Testing MCP Supabase connection...\n');
  
  try {
    // Create MCP config
    const mcpConfig = {
      "mcpServers": {
        "supabase": {
          "command": "npx",
          "args": [
            "-y",
            "mcp-remote",
            "https://mcp.supabase.com/mcp?project_ref=vaunihijmwwkhqagjqjd"
          ]
        }
      }
    };
    
    // Write config to file
    fs.writeFileSync('./mcp-config.json', JSON.stringify(mcpConfig, null, 2));
    console.log('✅ MCP config created');
    
    // Try to run MCP command
    console.log('🔄 Testing MCP connection...');
    
    const mcpProcess = spawn('npx', [
      '-y',
      'mcp-remote',
      'https://mcp.supabase.com/mcp?project_ref=vaunihijmwwkhqagjqjd'
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });
    
    let stdout = '';
    let stderr = '';
    
    mcpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    mcpProcess.on('close', (code) => {
      console.log(`📊 MCP Process exited with code: ${code}`);
      if (stdout) console.log(`📄 stdout: ${stdout}`);
      if (stderr) console.log(`❌ stderr: ${stderr}`);
    });
    
    mcpProcess.on('error', (error) => {
      console.log(`❌ MCP Error: ${error.message}`);
    });
    
    // Test direct database connection instead
    console.log('\n🔄 Testing direct database operations...');
    await testDirectOperations();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testDirectOperations() {
  const https = require('https');
  
  const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
  const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';
  
  try {
    // Test table operations
    console.log('1️⃣ Testing table operations:');
    
    // List all tables
    const tablesResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (tablesResponse.ok) {
      console.log('✅ Database connection successful');
    } else {
      console.log(`❌ Database connection failed: ${tablesResponse.status}`);
    }
    
    // Test specific table operations
    const operations = [
      { name: 'Users', table: 'users' },
      { name: 'Projects', table: 'projects' },
      { name: 'Clients', table: 'clients' },
      { name: 'SPI/CPI Snapshots', table: 'spi_cpi_daily_snapshot' }
    ];
    
    for (const op of operations) {
      console.log(`\n📋 Testing ${op.name}:`);
      
      const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/${op.table}?select=*&limit=3`, {
        headers: {
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Found ${data.length} records`);
        if (data.length > 0) {
          const sample = data[0];
          console.log(`   📊 Sample: ${JSON.stringify(sample).substring(0, 100)}...`);
        }
      } else {
        const error = await response.text();
        console.log(`   ❌ Error: ${error}`);
      }
    }
    
    console.log('\n✅ Direct database operations test complete!');
    
  } catch (error) {
    console.error('❌ Direct operations error:', error.message);
  }
}

testMCPSupabase().catch(console.error);
