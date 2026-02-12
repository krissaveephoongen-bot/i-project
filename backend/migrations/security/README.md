# Database Security Migrations

These scripts are intended to fix critical security issues in your database by enabling Row Level Security (RLS) and applying some sensible default policies.

## How to Apply These Migrations

You should run these scripts in your Supabase SQL Editor.

1.  Go to your Supabase Project Dashboard.
2.  Navigate to the **SQL Editor**.
3.  Execute the content of the SQL files in this directory in the following order:

    1.  `001_enable_rls.sql` - This enables RLS on the tables.
    2.  `002_default_deny_policies.sql` - This creates a default "deny" policy. **After running this, your application will likely get "permission denied" errors until you create specific policies.**
    3.  `003_fix_users_policy.sql` - This fixes a specific permissive policy on your `users` table.

## After Applying the Migrations

After running these scripts, RLS will be active and blocking all access by default (except for the `users` table, which has its own new policies). This is the expected and desired behavior for security.

You will now need to create RLS policies for each table to allow your application to access the data it needs. You should create policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` as required by your application's logic.

For more information on writing RLS policies, please refer to the [Supabase documentation on RLS](https://supabase.com/docs/guides/auth/row-level-security).

## About the "undefined_column" Error

The original error `code: "42703"` (undefined_column) might be a separate issue from RLS. If this error persists after securing your database, it likely indicates a schema mismatch between your Prisma schema (`prisma/schema.prisma`) and your actual database schema. You may need to run `prisma db push` or create a new migration with `prisma migrate dev` to synchronize your schema. However, please be cautious with these commands as they can alter your database structure.
