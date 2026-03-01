-- Reset migration system
-- This file is used to reset the drizzle migration tracking

-- Drop the migration tracking table
DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations__" CASCADE;

-- Recreate the migration tracking table
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations__" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
