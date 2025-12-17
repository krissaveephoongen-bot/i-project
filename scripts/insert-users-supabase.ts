import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// User data with all required fields
const users = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: "admin",
    position: "Vice President",
    department: "Project Management"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: "manager",
    position: "Senior Project Manager",
    department: "Project Management"
  },
  {
    email: "sophonwith.va@appworks.co.th",
    password: "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    name: "Sophonwith Valaisathien",
    role: "manager",
    position: "Senior Project Manager",
    department: "Project Management"
  },
  {
    email: "suthat.wa@appworks.co.th",
    password: "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    name: "Suthat Wanprom",
    role: "manager",
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "napapha.ti@appworks.co.th",
    password: "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    name: "Napapha Tipaporn",
    role: "manager",
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "thapana.ch@appworks.co.th",
    password: "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    name: "Thapana Chatmanee",
    role: "admin",
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    name: "Jakgrits Phoongen",
    role: "admin",
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "pannee.sa@appworks.co.th",
    password: "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    name: "Pannee Sae-Chee",
    role: "manager",
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "sasithon.su@appworks.co.th",
    password: "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    name: "Sasithon Sukha",
    role: "admin",
    position: "Project Coordinator",
    department: "Sales Administration"
  },
  {
    email: "nawin.bu@appworks.co.th",
    password: "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    name: "Nawin Bunjoputsa",
    role: "employee",
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "pattaraprapa.ch@appworks.co.th",
    password: "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    name: "Pattaraprapa Chotipattachakorn",
    role: "manager",
    position: "Senior Project Manager",
    department: "Project Management"
  }
];

async function insertUsers() {
  console.log('🔄 Starting user insertion...');
  
  for (const user of users) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .single();

      if (existingUser) {
        console.log(`ℹ️  User ${user.email} already exists, updating...`);
        
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: user.name,
            role: user.role,
            position: user.position,
            department: user.department,
            status: 'active',
            is_deleted: false,
            updated_at: new Date()
          })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;
        console.log(`✅ Updated user: ${user.email}`);
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            email: user.email.toLowerCase(),
            name: user.name,
            password: user.password, // Already hashed
            role: user.role,
            position: user.position,
            department: user.department,
            status: 'active',
            is_deleted: false,
            created_at: new Date(),
            updated_at: new Date()
          }]);

        if (insertError) throw insertError;
        console.log(`✅ Created user: ${user.email}`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing user ${user.email}:`, error.message);
    }
  }

  console.log('🎉 All users have been processed!');
}

// Run the function
insertUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
