// tests/e2e/global-teardown.ts
import { execSync } from 'child_process';
import path from 'path';
import url from 'url';

// Get __dirname equivalent in ESM
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalTeardown() {
  console.log('\n🗑️ Global Teardown started...');

  // 1. Re-seed the database to clean up after tests
  // This ensures a clean state for the next run
  console.log('🌱 Re-seeding database for cleanup...');
  try {
    execSync('npm run db:seed', { cwd: path.resolve(__dirname, '../../backend'), stdio: 'inherit' });
    console.log('✅ Database re-seeded successfully.');
  } catch (error) {
    console.error('❌ Database re-seeding failed during teardown:', error);
    // Do not exit process, just log error, so other teardown actions can run
  }

  // Add any other global cleanup logic here if needed
  // For example, stopping other services started by setup, clearing temp files, etc.

  console.log('🗑️ Global Teardown completed.');
}

export default globalTeardown;
