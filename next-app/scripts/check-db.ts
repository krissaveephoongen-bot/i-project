import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

// Create supabase client with loaded environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDatabase() {
  console.log('Checking database...');

  try {
    // Check users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .limit(5);

    console.log('Users:', users?.length || 0, userError?.message || 'OK');

    // Check projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(5);

    console.log('Projects:', projects?.length || 0, projectError?.message || 'OK');

    // Check tasks
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, name')
      .limit(5);

    console.log('Tasks:', tasks?.length || 0, taskError?.message || 'OK');

    // Check risks
    const { data: risks, error: riskError } = await supabase
      .from('risks')
      .select('id, risk')
      .limit(5);

    console.log('Risks:', risks?.length || 0, riskError?.message || 'OK');

  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
