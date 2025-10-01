import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.NETLIFY_DATABASE_URL) {
  throw new Error('Database URL not found in environment variables');
}

const sql = neon(process.env.NETLIFY_DATABASE_URL);
export const db = drizzle(sql);