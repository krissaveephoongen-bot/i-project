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

async function createWithTimestamps() {
  try {
    console.log('🔧 Creating projects with timestamps...\n');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const now = new Date().toISOString();
    
    // Try different timestamp field names
    const timestampFields = [
      { createdAt: now, updatedAt: now },
      { created_at: now, updated_at: now },
      { createdAt: now, updated_at: now },
      { created_at: now, updatedAt: now }
    ];
    
    for (const timestamps of timestampFields) {
      console.log(`Trying with fields: ${Object.keys(timestamps).join(', ')}`);
      
      const testProject = {
        id: uuidv4(),
        name: 'Test Project',
        status: 'active',
        ...timestamps
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(testProject)
        .select();
      
      if (error) {
        console.log(`❌ Failed:`, error.message);
      } else {
        console.log(`✅ Success with timestamp format!`);
        
        // Delete test project
        await supabase.from('projects').delete().eq('id', data[0].id);
        
        // Create real projects
        const realProjects = [
          {
            id: uuidv4(),
            name: 'Website Redesign',
            status: 'active',
            progress: 75,
            budget: 500000,
            spent: 350000,
            spi: 1.1,
            ...timestamps
          },
          {
            id: uuidv4(),
            name: 'Mobile App Development',
            status: 'active',
            progress: 45,
            budget: 750000,
            spent: 400000,
            spi: 0.9,
            ...timestamps
          },
          {
            id: uuidv4(),
            name: 'Cloud Migration',
            status: 'active',
            progress: 90,
            budget: 300000,
            spent: 280000,
            spi: 1.05,
            ...timestamps
          },
          {
            id: uuidv4(),
            name: 'Data Analytics Platform',
            status: 'pending',
            progress: 15,
            budget: 600000,
            spent: 80000,
            spi: 0.95,
            ...timestamps
          },
          {
            id: uuidv4(),
            name: 'Security Audit',
            status: 'completed',
            progress: 100,
            budget: 150000,
            spent: 145000,
            spi: 1.0,
            ...timestamps
          }
        ];
        
        const { data: createdProjects, error: createError } = await supabase
          .from('projects')
          .insert(realProjects)
          .select();
        
        if (createError) {
          console.error('❌ Error creating real projects:', createError.message);
        } else {
          console.log(`✅ Created ${createdProjects.length} projects!`);
          
          // Create milestones
          const milestones = [];
          createdProjects.forEach((project) => {
            for (let i = 0; i < 3; i++) {
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + (i * 30) + 30);
              
              milestones.push({
                id: uuidv4(),
                project_id: project.id,
                name: `Phase ${i + 1}`,
                status: i === 0 ? 'approved' : 'pending',
                percentage: Math.floor((100 / 3) * (i + 1)),
                due_date: dueDate.toISOString().split('T')[0],
                created_at: now
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
        
        break; // Found working format
      }
    }
    
    // Final verification
    const { data: finalProjects, error: finalError } = await supabase
      .from('projects')
      .select('id, name, status, progress, budget, spent, spi')
      .limit(10);
    
    if (finalError) {
      console.error('❌ Final verification error:', finalError.message);
    } else {
      console.log(`\n🎉 Total projects: ${finalProjects?.length || 0}`);
      finalProjects?.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.status}) - ${p.progress}% complete, SPI: ${p.spi}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createWithTimestamps();
