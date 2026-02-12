 -- Enforce email uniqueness (case-insensitive) and role/status domain via CHECK constraints
 DO $$
 BEGIN
   IF NOT EXISTS (
     SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'users_email_unique_ci'
   ) THEN
     EXECUTE 'CREATE UNIQUE INDEX users_email_unique_ci ON users (LOWER(email))';
   END IF;
 END $$;
 
 ALTER TABLE users
   ADD CONSTRAINT users_role_check CHECK (role IN ('admin','manager','employee'))
   NOT VALID;
 
 ALTER TABLE users
   ADD CONSTRAINT users_status_check CHECK (status IN ('active','inactive'))
   NOT VALID;
 
 ALTER TABLE users VALIDATE CONSTRAINT users_role_check;
 ALTER TABLE users VALIDATE CONSTRAINT users_status_check;
