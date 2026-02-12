import { db } from '../../lib/db';
import { users as usersTable } from '../../lib/schema';

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  position: string;
  department: string;
}

export const seedUsersData: SeedUser[] = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2b$10$2HPQ1EDY3iZqBNrOG5wdbO6CRhY/LqOejv/eNyhz2WHKmHCGwlnV2", // AppWorks@123!
    name: "Thanongsak Thongkwid",
    role: 'admin',
    position: "Vice President",
    department: "Project management"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2b$10$2HPQ1EDY3iZqBNrOG5wdbO6CRhY/LqOejv/eNyhz2WHKmHCGwlnV2", // AppWorks@123!
    name: "Pratya Fufueng",
    role: 'manager',
    position: "Senior Project Manager",
    department: "Project management"
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2b$10$2HPQ1EDY3iZqBNrOG5wdbO6CRhY/LqOejv/eNyhz2WHKmHCGwlnV2", // AppWorks@123!
    name: "Jakgrits Phoongen",
    role: 'employee',
    position: "Developer",
    department: "Development"
  },
  {
    email: "employee@company.com",
    password: "$2b$10$2HPQ1EDY3iZqBNrOG5wdbO6CRhY/LqOejv/eNyhz2WHKmHCGwlnV2", // AppWorks@123!
    name: "Demo Employee",
    role: 'employee',
    position: "Staff",
    department: "General"
  }
  // Add more users as needed
];

export async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  for (const user of seedUsersData) {
    await db.insert(usersTable).values(user).onConflictDoUpdate({
      target: usersTable.email,
      set: {
        name: user.name,
        password: user.password,
        role: user.role as any,
        position: user.position,
        department: user.department,
        updatedAt: new Date()
      }
    });
  }
  
  console.log('✅ Users seeded successfully');
}
