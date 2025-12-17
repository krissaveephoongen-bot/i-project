import { Client } from 'pg'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve('.env') })
dotenv.config({ path: resolve('.env.local') })

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set')
  }

  console.log('Connecting to database...')
  const client = new Client({
    connectionString,
  })

  await client.connect()
  console.log('Connected successfully')

  try {
    // Create tables
    console.log('Creating tables...')

    // User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "role" text NOT NULL DEFAULT 'user',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `)

    // Project table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "description" text,
        "budget" double precision NOT NULL,
        "startDate" timestamptz NOT NULL,
        "endDate" timestamptz,
        "status" text NOT NULL DEFAULT 'active',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `)

    // Cost table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Cost" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "projectId" uuid NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
        "description" text NOT NULL,
        "amount" double precision NOT NULL,
        "category" text NOT NULL,
        "date" timestamptz NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "submittedBy" uuid NOT NULL REFERENCES "User"("id"),
        "approvedBy" uuid REFERENCES "User"("id"),
        "invoiceNumber" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `)

    // Attachment table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Attachment" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "costId" uuid NOT NULL REFERENCES "Cost"("id") ON DELETE CASCADE,
        "filename" text NOT NULL,
        "url" text NOT NULL,
        "size" integer NOT NULL,
        "mimeType" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `)

    // CostApproval table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "CostApproval" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "costId" uuid NOT NULL REFERENCES "Cost"("id") ON DELETE CASCADE,
        "status" text NOT NULL,
        "comment" text,
        "approvedBy" uuid NOT NULL REFERENCES "User"("id"),
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `)

    console.log('Tables created successfully')

    // Seed initial data
    console.log('Seeding database with initial data...')

    const password = await hash('password123', 12)

    // Insert admin user
    const userResult = await client.query(
      `INSERT INTO "User" (name, email, password, role) VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, role`,
      ['Admin User', 'admin@example.com', password, 'admin']
    )

    // Insert project
    const projectResult = await client.query(
      `INSERT INTO "Project" (name, description, budget, "startDate", status) VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, budget, status`,
      [
        'Website Redesign',
        'Complete website redesign project',
        10000,
        new Date(),
        'active',
      ]
    )

    console.log('Database seeded successfully!')
    if (userResult.rows.length > 0) {
      console.log('Created user:', userResult.rows[0])
    } else {
      console.log('User already exists')
    }
    console.log('Created project:', projectResult.rows[0])
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    await client.end()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
