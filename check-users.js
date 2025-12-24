const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query('SELECT id, name, email, role, status FROM "User" LIMIT 10');
    console.log('Users in database:');
    console.log(result.rows);

    if (result.rows.length === 0) {
      console.log('No users found. Creating AppWorks users...');

      const realUsers = [
        {
          id: '82df756a-4d46-4e49-b927-bb165d7dc489',
          name: 'Thanongsak Thongkwid',
          email: 'thanongsak.th@appworks.co.th',
          password: '$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K',
          role: 'ADMIN',
          position: 'Vice President',
          department: 'Project management'
        },
        {
          id: 'cc4d0a66-5984-459f-92d8-32d4563bf9f1',
          name: 'Pratya Fufueng',
          email: 'pratya.fu@appworks.co.th',
          password: '$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K',
          role: 'PROJECT_MANAGER',
          position: 'Senior Project Manager',
          department: 'Project management'
        },
        {
          id: 'b74cded6-0ae9-44e2-813f-124e5908adaa',
          name: 'Sophonwith Valaisathien',
          email: 'sophonwith.va@appworks.co.th',
          password: '$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe',
          role: 'PROJECT_MANAGER',
          position: 'Senior Project Manager',
          department: 'Project management'
        },
        {
          id: '914439f4-1d31-4b4c-9465-6d1df4fa3d95',
          name: 'Suthat Wanprom',
          email: 'suthat.wa@appworks.co.th',
          password: '$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS',
          role: 'PROJECT_MANAGER',
          position: 'Project Manager',
          department: 'Project management'
        },
        {
          id: '07695a36-cb77-4bd6-a413-dbd4ad22aac0',
          name: 'Napapha Tipaporn',
          email: 'napapha.ti@appworks.co.th',
          password: '$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG',
          role: 'PROJECT_MANAGER',
          position: 'Project Manager',
          department: 'Project management'
        },
        {
          id: '69965309-5683-4436-999b-fb94030e398d',
          name: 'Thapana Chatmanee',
          email: 'thapana.ch@appworks.co.th',
          password: '$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O',
          role: 'ADMIN',
          position: 'Project Manager',
          department: 'Project management'
        },
        {
          id: '0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc',
          name: 'Jakgrits Phoongen',
          email: 'jakgrits.ph@appworks.co.th',
          password: '$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO',
          role: 'ADMIN',
          position: 'Project Manager',
          department: 'Project management'
        },
        {
          id: 'edaa1ff1-d7bb-4e03-9510-132d607899ee',
          name: 'Pannee Sae-Chee',
          email: 'pannee.sa@appworks.co.th',
          password: '$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO',
          role: 'PROJECT_MANAGER',
          position: 'Project Manager',
          department: 'Project management'
        },
        {
          id: 'd4e57618-7358-4e95-8bec-1c3d7904a8fa',
          name: 'Sasithon Sukha',
          email: 'sasithon.su@appworks.co.th',
          password: '$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW',
          role: 'ADMIN',
          position: 'Project Coordinator',
          department: 'Sales Administration'
        },
        {
          id: '56e2d716-faee-42bb-abbb-9c0d04cfbb64',
          name: 'Nawin Bunjoputsa',
          email: 'nawin.bu@appworks.co.th',
          password: '$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC',
          role: 'USER',
          position: 'Project Manager',
          department: 'Project management'
        },
        {
          id: '6aab71dd-03aa-4936-8091-a141ec3e2cf2',
          name: 'Pattaraprapa Chotipattachakorn',
          email: 'pattaraprapa.ch@appworks.co.th',
          password: '$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC',
          role: 'PROJECT_MANAGER',
          position: 'Senior Project Manager',
          department: 'Project management'
        }
      ];

      for (const userData of realUsers) {
        await client.query(`
          INSERT INTO "User" (id, name, email, password, role, position, department, status, timezone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          userData.id,
          userData.name,
          userData.email,
          userData.password,
          userData.role,
          userData.position,
          userData.department,
          'active',
          'Asia/Bangkok'
        ]);
        console.log(`✓ Created/Updated: ${userData.name} (${userData.email}) - ${userData.role}`);
      }

      console.log('\nAll AppWorks users imported successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkUsers();