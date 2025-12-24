const { executeQuery } = require('./database/neon-connection');
require('dotenv').config();

async function checkSchema() {
  try {
    const result = await executeQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'teams'
      ORDER BY ordinal_position
    `);

    console.log('Teams table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
