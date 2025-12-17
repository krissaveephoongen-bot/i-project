import { defineConfig } from '@prisma/engines';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
      provider: 'postgresql',
    },
  },
});
