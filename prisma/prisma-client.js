const { PrismaClient } = require('@prisma/client');

// Set the database URL in the environment
const databaseUrl = 'postgresql://neondb_owner:npg_6FSH4YyQIoeb@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&connection_limit=1';
process.env.DATABASE_URL = databaseUrl;

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    // For Prisma 7+ with Accelerate
    datasourceUrl: databaseUrl,
    // Required for Prisma 7+
    accelerateUrl: databaseUrl
  });
};

global.prisma = global.prisma || prismaClientSingleton();

module.exports = global.prisma;
