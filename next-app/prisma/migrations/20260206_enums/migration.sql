 DO $$
 BEGIN
   IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
     EXECUTE 'ALTER TYPE "UserRole" RENAME TO user_role';
   ELSIF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
     EXECUTE 'CREATE TYPE user_role AS ENUM (''admin'',''manager'',''employee'')';
   END IF;
 
   IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
     EXECUTE 'ALTER TYPE "UserStatus" RENAME TO user_status';
   ELSIF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
     EXECUTE 'CREATE TYPE user_status AS ENUM (''active'',''inactive'')';
   END IF;
 END $$;
 
 ALTER TABLE users
   ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
 
 UPDATE users SET status = CASE WHEN COALESCE("isActive", true) = true THEN 'active' ELSE 'inactive' END
 WHERE status IS NULL;
