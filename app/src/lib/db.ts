import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Convert postgres:// to postgresql:// if needed
const rawDatabaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

let db;

// Create mock db client for development if no database URL is provided
if (!rawDatabaseUrl && process.env.NODE_ENV === 'development') {
  console.warn('No database URL provided, using mock database for development');
  const mockClient = {
    query: async () => ({ rows: [] }),
  };
  db = drizzle(mockClient as any);
} else if (!rawDatabaseUrl) {
  throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL is required in production');
} else {
  const databaseUrl = rawDatabaseUrl.replace(/^postgres:\/\//, 'postgresql://');
  const client = neon(databaseUrl);
  db = drizzle(client);
}

export { db };