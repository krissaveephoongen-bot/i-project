import { Role } from '@prisma/client';
import prisma from '../config/prisma';

export const users = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: Role.ADMIN,
    position: "Vice President",
    department: "Project management"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: Role.PROJECT_MANAGER,
    position: "Senior Project Manager",
    department: "Project management"
  }
  // Add more users as needed
];

export async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  
  console.log('✅ Users seeded successfully');
}
