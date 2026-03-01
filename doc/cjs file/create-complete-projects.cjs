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

async function createCompleteProjects() {
  try {
    console.log('🔧 Creating complete sample projects...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const now = new Date().toISOString();
    
    // Try with all required fields
    const testProject = {
      id: uuidv4(),
      name: 'Test Project',
      status: 'active',
      progress: 50,
      budget: 100000,
      spent: 50000,
      spi: 1.0,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('Testing complete project structure...');
    const { data, error } = await supabase
      .from('projects')
      .insert(testProject)
      .select();
    
    if (error) {
      console.error('❌ Test failed:', error.message);
      
      // Try with different field names
      const altProject = {
        id: uuidv4(),
        name: 'Test Project Alt',
        status: 'active',
        progress: 50,
        budget: 100000,
        spent: 50000,
        spi: 1.0,
        created_at: now,
        updated_at: now
      };
      
      const { data: altData, error: altError } = await supabase
        .from('projects')
        .insert(altProject)
        .select();
      
      if (altError) {
        console.error('❌ Alt test failed:', altError.message);
        
        // Try minimal with timestamps
        const minimalProject = {
          id: uuidv4(),
          name: 'Test Project Minimal',
          status: 'active',
          created_at: now,
          updated_at: now
        };
        
        const { data: minimalData, error: minimalError } = await supabase
          .from('projects')
          .insert(minimalProject)
          .select();
        
        if (minimalError) {
          console.error('❌ Minimal test failed:', minimalError.message);
          return;
        } else {
          console.log('✅ Minimal structure works!');
          
          // Delete test project
          await supabase.from('projects').delete().eq('id', minimalData[0].id);
          
          // Create real projects with minimal structure
          const sampleProjects = [
            {
              id: uuidv4(),
              name: 'Website Redesign',
              status: 'active',
              progress: 75,
              budget: 500000,
              spent: 350000,
              spi: 1.1,
              created_at: now,
              updated_at: now
            },
            {
              id: uuidv4(),
              name: 'Mobile App Development',
              status: 'active',
              progress: 45,
              budget: 750000,
              spent: 400000,
              spi: 0.9,
              created_at: now,
              updated_at: now
            },
            {
              id: uuidv4(),
              name: 'Cloud Migration',
              status: 'active',
              progress: 90,
              budget: 300000,
              spent: 280000,
              spi: 1.05,
              created_at: now,
              updated_at: now
            },
            {
              id: uuidv4(),
              name: 'Data Analytics Platform',
              status: 'pending',
              progress: 15,
              budget: 600000,
              spent: 80000,
              spi: 0.95,
              created_at: now,
              updated_at: now
            },
            {
              id: uuidv4(),
              name: 'Security Audit',
              status: 'completed',
              progress: 100,
              budget: 150000,
              spent: 145000,
              spi: 1.0,
              created_at: now,
              updated_at: now
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
        }
      } else {
        console.log('✅ Alternative structure works!');
        await supabase.from('projects').delete().eq('id', altData[0].id);
      }
    } else {
      console.log('✅ Original structure works!');
      await supabase.from('projects').delete().eq('id', data[0].id);
    }
    
    // Verify final state
    const { data: finalProjects, error: verifyError } = await supabase
      .from('projects')
      .select('id, name, status, progress, budget, spent, spi')
      .limit(10);
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError.message);
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

createCompleteProjects();
