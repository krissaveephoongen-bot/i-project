import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const password = await hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      role: 'admin',
    },
  })

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete website redesign project',
      budget: 10000,
      startDate: new Date(),
      status: 'active',
    },
  })

  console.log('Database seeded successfully!')
  console.log({ user, project })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
