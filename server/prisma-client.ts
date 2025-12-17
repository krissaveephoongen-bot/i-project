import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Client } from 'pg'

let prisma: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  client.connect()

  prisma = new PrismaClient({
    adapter: new PrismaPg(client),
  })
} else {
  // Use a global variable to prevent multiple Prisma instances in development
  if (!global.prisma) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    client.connect()

    global.prisma = new PrismaClient({
      adapter: new PrismaPg(client),
    })
  }
  prisma = global.prisma
}

export default prisma
