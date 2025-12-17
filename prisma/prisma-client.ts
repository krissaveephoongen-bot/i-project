import { PrismaClient } from '@prisma/client';

// Set the database URL in the environment
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_6FSH4YyQIoeb@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&connection_limit=1';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
