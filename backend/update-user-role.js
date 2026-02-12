import { getDbClient } from './lib/db.js';
import { eq } from 'drizzle-orm';
import { users } from './lib/schema.js';

async function updateUserRole() {
  const { db } = getDbClient();
  if (!db) {
    console.error('Database not configured');
    return;
  }

  try {
    console.log('Updating user role to admin...');
    const result = await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, 'jakgrits.ph@appworks.co.th'))
      .returning();

    console.log('User updated successfully:', result);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

updateUserRole();