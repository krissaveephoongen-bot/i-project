const { Client } = require('pg');
const bcrypt = require('bcrypt');

const users = [
  {
    "email": "thanongsak.th@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Thanongsak Thongkwid",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "82df756a-4d46-4e49-b927-bb165d7dc489",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Vice President",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "pratya.fu@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Pratya Fufueng",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "cc4d0a66-5984-459f-92d8-32d4563bf9f1",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Senior Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "sophonwith.va@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Sophonwith Valaisathien",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "b74cded6-0ae9-44e2-813f-124e5908adaa",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Senior Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "suthat.wa@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Suthat Wanprom",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "914439f4-1d31-4b4c-9465-6d1df4fa3d95",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "napapha.ti@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Napapha Tipaporn",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "07695a36-cb77-4bd6-a413-dbd4ad22aac0",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "thapana.ch@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Thapana Chatmanee",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "69965309-5683-4436-999b-fb94030e398d",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "jakgrits.ph@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Jakgrits Phoongen",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "pannee.sa@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Pannee Sae-Chee",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "edaa1ff1-d7bb-4e03-9510-132d607899ee",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Manager",
    "employeeCode": null,
    "department": "Project management"
  },
  {
    "email": "sasithon.su@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Sasithon Sukha",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-15T15:36:35.482Z",
    "id": "d4e57618-7358-4e95-8bec-1c3d7904a8fa",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Coordinator",
    "employeeCode": null,
    "department": "Sales Administration"
  },
  {
    "email": "nawin.bu@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Nawin Bunjoputsa",
    "role": "USER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-16T10:35:16.155Z",
    "id": "56e2d716-faee-42bb-abbb-9c0d04cfbb64",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Project Manager",
    "employeeCode": "0276",
    "department": "Project management"
  },
  {
    "email": "pattaraprapa.ch@appworks.co.th",
    "password": "AppWorks@123!",
    "name": "Pattaraprapa Chotipattachakorn",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2025-07-15T15:36:35.482Z",
    "updatedAt": "2025-07-16T11:08:06.230Z",
    "id": "6aab71dd-03aa-4936-8091-a141ec3e2cf2",
    "failedLoginAttempts": 0,
    "isDeleted": false,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "position": "Senior Project Manager",
    "employeeCode": "0222",
    "department": "Project management"
  }
];

async function addUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    for (const user of users) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Map role
      let role = user.role;
      if (role === 'MANAGER') {
        role = 'PROJECT_MANAGER';
      }

      // Map status
      const status = user.isActive ? 'active' : 'inactive';

      // Insert user
      await client.query(`
        INSERT INTO "User" (
          id, name, email, password, role, position, department,
          status, lastLogin, resetToken, "resetTokenExpires",
          "createdAt", "updatedAt", employee_code, is_active,
          is_deleted, failed_login_attempts, locked_until
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18
        )
        ON CONFLICT (email) DO NOTHING
      `, [
        user.id,
        user.name,
        user.email,
        hashedPassword,
        role,
        user.position,
        user.department,
        status,
        user.lastLogin,
        user.resetToken,
        user.resetTokenExpiry,
        user.createdAt,
        user.updatedAt,
        user.employeeCode,
        user.isActive,
        user.isDeleted,
        user.failedLoginAttempts,
        user.lockedUntil
      ]);

      console.log(`Added user: ${user.email}`);
    }

    console.log('All users added successfully!');
  } catch (error) {
    console.error('Error adding users:', error);
  } finally {
    await client.end();
  }
}

addUsers();