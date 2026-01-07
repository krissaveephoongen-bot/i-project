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
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: 'admin',
    position: "Vice President",
    department: "Project management"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: 'manager',
    position: "Senior Project Manager",
    department: "Project management"
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2b$10$CJbjAEbEsj23XWYU1GnWauwK51lWCgRmJt.NPH.2DbF6jkw.zwIAq",
    name: "Jakgrits Phoongen",
    role: 'employee',
    position: "Developer",
    department: "Development"
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
