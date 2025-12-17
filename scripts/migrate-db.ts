import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Client } from 'pg'

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set')
}

async function main() {
  const client = new Client({
    connectionString: connectionString,
  })

  await client.connect()

  const prisma = new PrismaClient({
    adapter: new PrismaPg(client),
  })

  // Run migrations or other setup code here
  console.log('Connected to database successfully!')
  console.log('Now run: npx prisma db push')

  await prisma.$disconnect()
  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
