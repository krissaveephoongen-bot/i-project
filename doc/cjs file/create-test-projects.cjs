const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Load production environment
const env = fs.readFileSync('.env.production', 'utf8');
const lines = env.split('\n');
lines.forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/\"/g, '');
      process.env[key] = value;
    }
  }
});

async function createTestProjects() {
  try {
    console.log('🔧 Creating test projects in production...\n');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const now = new Date().toISOString();
    
    // Create projects one by one to see what works
    const projectData = {
      id: uuidv4(),
      name: 'Test Project 1',
      status: 'active',
      progress: 50,
      budget: 100000,
      spent: 50000,
      spi: 1.0
    };
    
    console.log('Creating first project...');
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select();
    
    if (error) {
      console.error('❌ Error creating project:', error.message);
      
      // Try with different status values
      const statuses = ['pending', 'completed', 'in_progress'];
      for (const status of statuses) {
        console.log(`\nTrying with status: "${status}"`);
        
        const testProject = {
          id: uuidv4(),
          name: `Test ${status}`,
          status: status
        };
        
        const { data: testData, error: testError } = await supabase
          .from('projects')
          .insert(testProject)
          .select();
        
        if (testError) {
          console.log(`❌ Status "${status}" failed:`, testError.message);
        } else {
          console.log(`✅ Status "${status}" works!`);
          
          // Delete test project
          await supabase.from('projects').delete().eq('id', testData[0].id);
          
          // Create real projects with this status
          const realProjects = [
            {
              id: uuidv4(),
              name: 'Website Redesign',
              status: status,
              progress: 75,
              budget: 500000,
              spent: 350000,
              spi: 1.1
            },
            {
              id: uuidv4(),
              name: 'Mobile App Development',
              status: status,
              progress: 45,
              budget: 750000,
              spent: 400000,
              spi: 0.9
            },
            {
              id: uuidv4(),
              name: 'Cloud Migration',
              status: status,
              progress: 90,
              budget: 300000,
              spent: 280000,
              spi: 1.05
            }
          ];
          
          const { data: createdProjects, error: createError } = await supabase
            .from('projects')
            .insert(realProjects)
            .select();
          
          if (createError) {
            console.error('❌ Error creating real projects:', createError.message);
          } else {
            console.log(`✅ Created ${createdProjects.length} real projects!`);
            
            // Show created projects
            console.log('\n📋 Created Projects:');
            createdProjects.forEach((p, i) => {
              console.log(`  ${i + 1}. ${p.name} (${p.status}) - Progress: ${p.progress}%, SPI: ${p.spi}`);
            });
          }
          
          break;
        }
      }
    } else {
      console.log('✅ First project created successfully!');
      console.log('Project data:', data[0]);
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const { data: finalProjects, error: finalError } = await supabase
      .from('projects')
      .select('id, name, status, progress, budget, spent, spi')
      .limit(10);
    
    if (finalError) {
      console.error('❌ Final verification error:', finalError.message);
    } else {
      console.log(`\n🎉 Total projects in database: ${finalProjects?.length || 0}`);
      finalProjects?.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.status}) - ${p.progress}% complete, Budget: ${p.budget}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Creation error:', err.message);
  }
}

createTestProjects();
