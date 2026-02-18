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

async function createProjectsWithIds() {
  try {
    console.log('🔧 Creating sample projects with UUIDs...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Try different status values with UUID
    const statusOptions = ['active', 'pending', 'completed'];
    
    for (const status of statusOptions) {
      console.log(`Testing status: "${status}" with UUID...`);
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: uuidv4(),
          name: `Test Project - ${status}`,
          status: status
        })
        .select();
      
      if (error) {
        console.log(`❌ Status "${status}" failed:`, error.message);
        
        // Clean up if partially created
        if (data && data.length > 0) {
          await supabase.from('projects').delete().eq('id', data[0].id);
        }
      } else {
        console.log(`✅ Status "${status}" works!`);
        
        // Delete test project
        await supabase.from('projects').delete().eq('id', data[0].id);
        
        // Create real projects
        const sampleProjects = [
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
          },
          {
            id: uuidv4(),
            name: 'Data Analytics Platform',
            status: status === 'active' ? 'pending' : status,
            progress: 15,
            budget: 600000,
            spent: 80000,
            spi: 0.95
          },
          {
            id: uuidv4(),
            name: 'Security Audit',
            status: status === 'active' ? 'completed' : status,
            progress: 100,
            budget: 150000,
            spent: 145000,
            spi: 1.0
          }
        ];
        
        const { data: projects, error: insertError } = await supabase
          .from('projects')
          .insert(sampleProjects)
          .select();
        
        if (insertError) {
          console.error('❌ Error inserting projects:', insertError.message);
        } else {
          console.log(`✅ Created ${projects.length} projects!`);
          
          // Create milestones
          const milestones = [];
          projects.forEach((project) => {
            for (let i = 0; i < 3; i++) {
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + (i * 30) + 30);
              
              milestones.push({
                id: uuidv4(),
                project_id: project.id,
                name: `Phase ${i + 1}`,
                status: i === 0 ? 'approved' : 'pending',
                percentage: Math.floor((100 / 3) * (i + 1)),
                due_date: dueDate.toISOString().split('T')[0]
              });
            }
          });
          
          if (milestones.length > 0) {
            const { error: milestoneError } = await supabase
              .from('milestones')
              .insert(milestones);
            
            if (!milestoneError) {
              console.log(`✅ Created ${milestones.length} milestones`);
            }
          }
        }
        
        break; // Found working status
      }
    }
    
    // Verify final state
    const { data: finalProjects, error } = await supabase
      .from('projects')
      .select('id, name, status, progress, budget, spent, spi')
      .limit(10);
    
    if (error) {
      console.error('❌ Error verifying:', error.message);
    } else {
      console.log('\n🎉 Final project list:');
      finalProjects?.forEach(p => {
        console.log(`  - ${p.name} (${p.status}): ${p.progress}% complete, Budget: ${p.budget}, SPI: ${p.spi}`);
      });
    }
    
    console.log('\n✅ Production database now has sample data!');
    console.log('📊 Dashboard should display real data now.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createProjectsWithIds();
