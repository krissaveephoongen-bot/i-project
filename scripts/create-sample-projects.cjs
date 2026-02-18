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

async function createSampleProjects() {
  try {
    console.log('🔧 Creating sample projects...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const sampleProjects = [
      {
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        status: 'Active',
        progress: 75,
        budget: 500000,
        spent: 350000,
        spi: 1.1,
        manager_id: null,
        client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Mobile App Development',
        description: 'Native iOS and Android app',
        status: 'Active',
        progress: 45,
        budget: 750000,
        spent: 400000,
        spi: 0.9,
        manager_id: null,
        client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Cloud Migration',
        description: 'Migrate infrastructure to AWS',
        status: 'Active',
        progress: 90,
        budget: 300000,
        spent: 280000,
        spi: 1.05,
        manager_id: null,
        client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Data Analytics Platform',
        description: 'Build real-time analytics dashboard',
        status: 'Planning',
        progress: 15,
        budget: 600000,
        spent: 80000,
        spi: 0.95,
        manager_id: null,
        client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Security Audit',
        description: 'Comprehensive security assessment',
        status: 'Completed',
        progress: 100,
        budget: 150000,
        spent: 145000,
        spi: 1.0,
        manager_id: null,
        client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Insert sample projects
    const { data, error } = await supabase
      .from('projects')
      .insert(sampleProjects)
      .select();
    
    if (error) {
      console.error('❌ Error creating projects:', error.message);
      return;
    }
    
    console.log(`✅ Successfully created ${data?.length || 0} sample projects`);
    
    // Create sample milestones
    const milestones = [];
    data?.forEach((project, index) => {
      const milestoneCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < milestoneCount; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (i * 30));
        
        milestones.push({
          project_id: project.id,
          name: `Milestone ${i + 1}`,
          description: `Key deliverable ${i + 1}`,
          status: Math.random() > 0.3 ? 'approved' : 'pending',
          percentage: Math.floor((100 / milestoneCount) * (i + 1)),
          due_date: dueDate.toISOString().split('T')[0],
          created_at: new Date().toISOString()
        });
      }
    });
    
    if (milestones.length > 0) {
      const { error: milestoneError } = await supabase
        .from('milestones')
        .insert(milestones);
      
      if (milestoneError) {
        console.error('❌ Error creating milestones:', milestoneError.message);
      } else {
        console.log(`✅ Created ${milestones.length} sample milestones`);
      }
    }
    
    // Trigger SPI/CPI snapshot
    console.log('🔄 Triggering SPI/CPI snapshot...');
    const snapshotResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/spi-cpi-snapshot`, {
      method: 'POST'
    });
    
    if (snapshotResponse.ok) {
      const result = await snapshotResponse.json();
      console.log('✅ Snapshot result:', result);
    } else {
      console.log('⚠️ Snapshot failed, but projects created successfully');
    }
    
    console.log('\n🎉 Sample data creation complete!');
    console.log('📊 Dashboard should now show data in production');
    
  } catch (err) {
    console.error('❌ Creation error:', err.message);
  }
}

createSampleProjects();
