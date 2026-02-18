/**
 * Verify Enum Types in Database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEnums() {
  try {
    console.log('🔍 Checking enum types in database...\n');
    
    // Query to get all enum types
    const result = await prisma.$queryRaw`
      SELECT t.typname as enum_name, 
             array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    
    console.log('📋 Enum types found in database:');
    console.log('='.repeat(60));
    
    result.forEach(row => {
      console.log(`\n✅ ${row.enum_name}:`);
      console.log(`   Values: ${row.enum_values.join(', ')}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Total enums: ${result.length}`);
    
    // Check if all expected enums exist
    const expectedEnums = [
      'user_role', 'user_status',
      'ProjectStatus', 'ProjectPriority', 'RiskLevel',
      'TaskStatus', 'TaskPriority', 'TaskCategory',
      'WorkType', 'TimeEntryStatus',
      'LeaveType', 'LeaveStatus',
      'ExpenseCategory', 'ExpenseStatus', 'PaymentMethod',
      'ClientStatus', 'ClientType',
      'SalesStatus', 'SalesStage',
      'StakeholderRole', 'StakeholderType', 'InvolvementLevel',
      'ResourceType', 'ResourceStatus', 'AllocationStatus',
      'ActivityType', 'AuditSeverity',
      'MilestoneStatus',
      'RiskImpact', 'RiskProbability', 'RiskStatus',
      'Status', 'Priority'
    ];
    
    const foundNames = result.map(r => r.enum_name);
    const missing = expectedEnums.filter(e => !foundNames.includes(e));
    
    if (missing.length > 0) {
      console.log('\n⚠️  Missing enums:', missing.join(', '));
    } else {
      console.log('\n✅ All expected enums are present!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEnums();
