// Use MCP to fix Vercel environment variables
const https = require('https');

async function fixVercelEnvironment() {
  console.log('🔧 Fixing Vercel Environment Variables using MCP...\n');
  
  try {
    // Step 1: Check current production environment
    console.log('1️⃣ Checking current production environment:');
    
    const prodCheck = await fetch('https://i-projects.skin/api/dashboard/portfolio', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (prodCheck.ok) {
      const portfolioData = await prodCheck.json();
      console.log(`📊 Current production finds ${portfolioData.rows?.length || 0} projects`);
      
      if (portfolioData.rows && portfolioData.rows.length > 0) {
        const sampleProject = portfolioData.rows[0];
        console.log(`📊 Sample project: "${sampleProject.name}"`);
        
        // Check if using old or new database
        if (sampleProject.name.includes('เว็บไซต์') || sampleProject.name.includes('ระบบ')) {
          console.log('✅ Production is already using NEW database');
        } else {
          console.log('❌ Production is still using OLD database');
          console.log('🔧 Need to update Vercel environment variables');
          
          // Step 2: Create a deployment script to force env update
          console.log('\n2️⃣ Creating deployment script to force environment update...');
          
          await createDeploymentScript();
        }
      }
    } else {
      console.log(`❌ Production check failed: ${prodCheck.status}`);
    }
    
    // Step 3: Test new database connection
    console.log('\n3️⃣ Testing new database connection:');
    await testNewDatabaseConnection();
    
    // Step 4: Generate environment update commands
    console.log('\n4️⃣ Generating environment update commands:');
    await generateEnvUpdateCommands();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function createDeploymentScript() {
  const fs = require('fs');
  
  const script = `#!/bin/bash
# Force update Vercel environment variables
echo "🔄 Forcing Vercel environment update..."

# Step 1: Remove existing env vars
echo "🗑️ Removing existing environment variables..."
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production  
vercel env rm SUPABASE_SERVICE_ROLE_KEY production

# Step 2: Add new env vars
echo "➕ Adding new environment variables..."
echo "https://vaunihijmwwkhqagjqjd.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.5y9iB5QK8L2eX3m7n8wR6pF9sT1kL2jH3gV4cY8wZ7k" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Step 3: Deploy to apply changes
echo "🚀 Deploying to apply environment changes..."
vercel --prod

echo "✅ Environment update complete!"
`;
  
  fs.writeFileSync('./fix-vercel-env.sh', script);
  console.log('✅ Deployment script created: fix-vercel-env.sh');
  
  // Make it executable (on Unix systems)
  try {
    require('child_process').execSync('chmod +x ./fix-vercel-env.sh');
    console.log('✅ Script made executable');
  } catch (error) {
    console.log('ℹ️  Script created (chmod not available on Windows)');
  }
}

async function testNewDatabaseConnection() {
  const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
  const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';
  
  try {
    const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/projects?select=name,status&limit=3`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const projects = await response.json();
      console.log(`✅ New database connection successful - Found ${projects.length} projects`);
      projects.forEach(p => console.log(`   - ${p.name} (${p.status})`));
    } else {
      console.log(`❌ New database connection failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
  }
}

async function generateEnvUpdateCommands() {
  console.log('📋 Manual environment update commands for Vercel Dashboard:');
  console.log('');
  console.log('1. Go to Vercel Dashboard → i-project → Settings → Environment Variables');
  console.log('2. Update the following variables:');
  console.log('');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:');
  console.log('   https://vaunihijmwwkhqagjqjd.supabase.co');
  console.log('');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:');
  console.log('   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw');
  console.log('');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:');
  console.log('   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.5y9iB5QK8L2eX3m7n8wR6pF9sT1kL2jH3gV4cY8wZ7k');
  console.log('');
  console.log('3. Save changes and redeploy');
  console.log('4. Test APIs: https://i-projects.skin/api/dashboard/portfolio');
  console.log('');
  
  // Create a quick test script
  const testScript = `// Quick test after environment update
const fetch = require('node-fetch');

async function testAfterUpdate() {
  console.log('🧪 Testing after environment update...');
  
  try {
    const response = await fetch('https://i-projects.skin/api/dashboard/portfolio');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Portfolio API working!');
      console.log(\`📊 Projects: \${data.rows?.length || 0}\`);
      
      if (data.rows && data.rows.length > 0) {
        const sample = data.rows[0];
        console.log(\`📊 Sample: \${sample.name}\`);
        
        if (sample.name.includes('เว็บไซต์') || sample.name.includes('ระบบ')) {
          console.log('🎉 SUCCESS! Using new database with Thai project names');
        } else {
          console.log('⚠️ Still using old database');
        }
      }
    } else {
      console.log(\`❌ API Error: \${response.status}\`);
    }
    
    // Test Executive Report
    const execResponse = await fetch('https://i-projects.skin/api/projects/executive-report');
    console.log(\`📊 Executive Report: \${execResponse.status}\`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAfterUpdate();
`;
  
  require('fs').writeFileSync('./test-after-update.cjs', testScript);
  console.log('✅ Test script created: test-after-update.cjs');
  console.log('   Run with: node test-after-update.cjs');
}

fixVercelEnvironment().catch(console.error);
