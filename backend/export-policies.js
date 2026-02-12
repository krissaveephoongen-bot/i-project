import { getDbClient } from './lib/db.js';

async function exportPolicies() {
  const { client: sql } = getDbClient();

  if (!sql) {
    console.error('Database connection not available');
    return;
  }

  try {
    // Run the reset-all-policies.sql script first
    console.log('Running reset-all-policies.sql...');
    const fs = await import('fs');
    const path = await import('path');
    const sqlFilePath = path.join(process.cwd(), '../reset-all-policies.sql');
    console.log('SQL file path:', sqlFilePath);

    if (!fs.existsSync(sqlFilePath)) {
      console.error('SQL file not found at:', sqlFilePath);
      return;
    }

    try {
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      console.log('SQL file loaded, length:', sqlContent.length);

      // Execute the entire SQL content
      await sql.unsafe(sqlContent);
      console.log('Reset policies script completed successfully.');
    } catch (error) {
      console.error('Failed to execute reset policies script:', error.message);
      console.error('Error details:', error);
    }

    console.log('Exporting database structure and RLS policies...');

    // Get database structure
    console.log('\nDatabase Tables and Columns:');
    console.log('============================');

    const tables = await sql`
      SELECT
        schemaname,
        tablename,
        tableowner
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `;

    for (const table of tables) {
      console.log(`\n${table.schemaname}.${table.tablename} (owner: ${table.tableowner})`);

      const columns = await sql`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = ${table.schemaname}
          AND table_name = ${table.tablename}
        ORDER BY ordinal_position
      `;

      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
      });
    }

    // Get foreign key relationships
    console.log('\nForeign Key Relationships:');
    console.log('==========================');

    const fks = await sql`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tc.table_schema, tc.table_name, kcu.column_name
    `;

    fks.forEach(fk => {
      console.log(`${fk.table_schema}.${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_schema}.${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // Check RLS status
    console.log('\nRLS Status on Tables:');
    console.log('=====================');

    const rlsStatus = await sql`
      SELECT
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `;

    rlsStatus.forEach(table => {
      console.log(`${table.schemaname}.${table.tablename}: RLS ${table.rls_enabled ? 'ENABLED' : 'DISABLED'}`);
    });

    // Query to get all policies
    const policies = await sql`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      ORDER BY schemaname, tablename, policyname
    `;

    console.log('\nCurrent RLS Policies:');
    console.log('===================');

    if (policies.length === 0) {
      console.log('No policies found.');
    } else {
      policies.forEach(policy => {
        console.log(`Schema: ${policy.schemaname}`);
        console.log(`Table: ${policy.tablename}`);
        console.log(`Policy: ${policy.policyname}`);
        console.log(`Permissive: ${policy.permissive}`);
        console.log(`Roles: ${policy.roles ? policy.roles.join(', ') : 'null'}`);
        console.log(`Command: ${policy.cmd}`);
        console.log(`Using: ${policy.qual || 'null'}`);
        console.log(`With Check: ${policy.with_check || 'null'}`);
        console.log('---');
      });

      console.log('\nGenerated CREATE POLICY statements:');
      console.log('=====================================');
  
      // Generate CREATE POLICY statements
      const createStatements = policies.map(policy => {
        let stmt = `CREATE POLICY "${policy.policyname}" ON ${policy.schemaname}.${policy.tablename}`;
  
        if (!policy.permissive) {
          stmt += ' AS RESTRICTIVE';
        } else {
          stmt += ' AS PERMISSIVE';
        }
  
        stmt += ` FOR ${policy.cmd}`;
  
        if (policy.roles && policy.roles.length > 0) {
          stmt += ` TO ${policy.roles.join(', ')}`;
        }
  
        if (policy.qual) {
          stmt += ` USING (${policy.qual})`;
        }
  
        if (policy.with_check) {
          stmt += ` WITH CHECK (${policy.with_check})`;
        }
  
        stmt += ';';
        return stmt;
      });
  
      createStatements.forEach(stmt => {
        console.log(stmt);
      });
  
    }

  } catch (error) {
    console.error('Error exporting policies:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

exportPolicies();