const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

async function createSimpleProjects() {
  try {
    console.log('🔧 Creating sample projects...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Start with minimal required fields
    const sampleProjects = [
      {
        name: 'Website Redesign',
        status: 'Active',
        progress: 75,
        budget: 500000,
        spent: 350000,
        spi: 1.1
      },
      {
        name: 'Mobile App Development',
        status: 'Active',
        progress: 45,
        budget: 750000,
        spent: 400000,
        spi: 0.9
      },
      {
        name: 'Cloud Migration',
        status: 'Active',
        progress: 90,
        budget: 300000,
        spent: 280000,
        spi: 1.05
      }
    ];
    
    // Try inserting one project at a time to see what works
    for (let i = 0; i < sampleProjects.length; i++) {
      const project = sampleProjects[i];
      console.log(`Creating project: ${project.name}`);
      
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select();
      
      if (error) {
        console.error(`❌ Error creating "${project.name}":`, error.message);
        
        // Try with even fewer fields
        const minimalProject = {
          name: project.name,
          status: project.status
        };
        
        const { data: minimalData, error: minimalError } = await supabase
          .from('projects')
          .insert(minimalProject)
          .select();
        
        if (minimalError) {
          console.error(`❌ Even minimal insert failed:`, minimalError.message);
        } else {
          console.log(`✅ Created minimal project: ${project.name}`);
          
          // Now try to update with additional fields
          const updateData = {
            progress: project.progress,
            budget: project.budget,
            spent: project.spent,
            spi: project.spi
          };
          
          const { error: updateError } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', minimalData[0].id);
          
          if (updateError) {
            console.error(`❌ Error updating project:`, updateError.message);
          } else {
            console.log(`✅ Updated project with additional data`);
          }
        }
      } else {
        console.log(`✅ Successfully created project: ${project.name}`);
      }
    }
    
    // Verify projects were created
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, progress, budget, spent, spi')
      .limit(5);
    
    if (error) {
      console.error('❌ Error verifying projects:', error.message);
    } else {
      console.log('\n✅ Current projects in database:');
      projects?.forEach(p => {
        console.log(`  - ${p.name}: Progress ${p.progress}%, Budget ${p.budget}, SPI ${p.spi}`);
      });
    }
    
    console.log('\n🎉 Sample data creation complete!');
    
  } catch (err) {
    console.error('❌ Creation error:', err.message);
  }
}

createSimpleProjects();
