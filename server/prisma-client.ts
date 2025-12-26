const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Client } = require('pg')

let prisma: PrismaClient | undefined

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (prisma) return prisma

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    client.connect()

    prisma = new PrismaClient({
      adapter: new PrismaPg(client),
    } as any)

    // Store globally in development
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma
    }

    return prisma
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error)
    throw error
  }
}

// CommonJS export for JavaScript files
const module_exports = {
  getPrismaClient,
  get prisma() {
    return getPrismaClient()
  }
}

// Export for CommonJS
module.exports = module_exports
