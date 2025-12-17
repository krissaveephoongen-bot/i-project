import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';

dotenv.config();

async function addSettingsTable() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgres://user:password@localhost:5432/project_management';

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  const db = drizzle(pool);

  try {
    console.log('📋 Creating system_settings table...\n');

    // System Settings table for features and configuration
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL,
        type TEXT DEFAULT 'string', -- string, boolean, number, json
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ System settings table created');

    // Insert default settings
    const defaultSettings = [
      {
        key: 'feature.websocket.enabled',
        value: { enabled: false, message: 'WebSocket feature disabled in production' },
        type: 'json',
        description: 'Enable/disable WebSocket for real-time collaboration',
      },
      {
        key: 'feature.ai.enabled',
        value: { enabled: false, provider: 'none' },
        type: 'json',
        description: 'Enable/disable AI features',
      },
      {
        key: 'security.password.hashing',
        value: { algorithm: 'bcrypt', rounds: 10 },
        type: 'json',
        description: 'Password hashing configuration',
      },
      {
        key: 'security.encryption.method',
        value: { method: 'AES-256-GCM', enabled: true },
        type: 'json',
        description: 'Encryption method for sensitive data',
      },
      {
        key: 'export.pdf.enabled',
        value: { enabled: true, format: 'A4' },
        type: 'json',
        description: 'PDF export functionality',
      },
      {
        key: 'export.csv.enabled',
        value: { enabled: true },
        type: 'json',
        description: 'CSV export functionality',
      },
      {
        key: 'api.timeout.default',
        value: { milliseconds: 30000 },
        type: 'json',
        description: 'Default API timeout in milliseconds',
      },
      {
        key: 'api.retries.max_attempts',
        value: { attempts: 3, backoff_ms: 1000 },
        type: 'json',
        description: 'API retry configuration',
      },
    ];

    for (const setting of defaultSettings) {
      try {
        await db.execute(sql`
          INSERT INTO system_settings (key, value, type, description)
          VALUES (${setting.key}, ${JSON.stringify(setting.value)}, ${setting.type}, ${setting.description})
          ON CONFLICT (key) DO NOTHING;
        `);
        console.log(`✅ Setting initialized: ${setting.key}`);
      } catch (e: any) {
        console.log(`⚠️  Setting already exists: ${setting.key}`);
      }
    }

    console.log('\n✨ ✨ ✨ SETTINGS TABLE SETUP COMPLETED ✨ ✨ ✨\n');
  } catch (error) {
    console.error('❌ Error setting up settings table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addSettingsTable().catch(console.error);
