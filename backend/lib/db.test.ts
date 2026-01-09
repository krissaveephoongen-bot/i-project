import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkDatabaseConnection } from './db.js'; // Assuming db.js is the entry
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  vi.resetModules(); // Reset modules before each test to clear caches
  process.env = { ...originalEnv }; // Make a copy of process.env
});
afterEach(() => {
  process.env = originalEnv; // Restore original process.env
});

// Mock postgres and drizzle-orm
vi.mock('postgres');
vi.mock('drizzle-orm/postgres-js', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    drizzle: vi.fn(), // Mock drizzle constructor
  };
});

describe('checkDatabaseConnection', () => {
  it('should return success true if database connection is successful', async () => {
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/testdb';

    // Mock postgres client to return a successful query
    const mockQueryResult = [{ health_check: 1 }];
    const mockPostgresClient = vi.fn(() => ({
      // Mock the template string function for `sql` queries
      [Symbol.for('tag')]: vi.fn(async () => mockQueryResult),
      // Mock other client methods if necessary
    }));
    (postgres as any).mockImplementation(mockPostgresClient);

    // Mock drizzle constructor
    (drizzle as any).mockReturnValue({
      // Mock drizzle instance if needed, but not directly used by checkDatabaseConnection
    });

    const result = await checkDatabaseConnection();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockQueryResult);
    expect(mockPostgresClient).toHaveBeenCalledWith(
      process.env.DATABASE_URL,
      expect.any(Object)
    );
  });

  it('should return success false if DATABASE_URL is not defined', async () => {
    delete process.env.DATABASE_URL;

    const result = await checkDatabaseConnection();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection not configured');
    expect(result.code).toBe('NOT_CONFIGURED');
    expect(postgres).not.toHaveBeenCalled(); // Ensure postgres is not called
  });

  it('should return success false if database connection fails during creation', async () => {
    process.env.DATABASE_URL = 'postgres://invalid:invalid@localhost:5432/invalid';

    const mockError = new Error('Connection refused');
    (postgres as any).mockImplementation(() => {
      throw mockError; // Simulate connection error
    });

    const result = await checkDatabaseConnection();

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);
    expect(result.code).toBe('UNKNOWN'); // Default error code when postgres throws
    expect(postgres).toHaveBeenCalled();
  });

  it('should return success false if database query fails', async () => {
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/testdb';

    const mockQueryError = new Error('Query failed');
    const mockPostgresClient = vi.fn(() => ({
      [Symbol.for('tag')]: vi.fn(async () => { throw mockQueryError; }), // Simulate query error
    }));
    (postgres as any).mockImplementation(mockPostgresClient);
    
    (drizzle as any).mockReturnValue({}); // Ensure drizzle is mocked

    const result = await checkDatabaseConnection();

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockQueryError.message);
    expect(result.code).toBe('UNKNOWN');
  });
});