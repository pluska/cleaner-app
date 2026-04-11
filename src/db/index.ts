import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

let client;

// When running in a standard Node.js/Cloudflare environment
if (typeof process !== "undefined" && process.env.DATABASE_URL) {
  client = createClient({ url: process.env.DATABASE_URL });
} else {
  // Fallback for local development if standard binding isn't injected
  client = createClient({
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/6bad73e71aaadefb3e43693c832d8c11be6d95047849063b99f190f8786a53ca.sqlite",
  });
}

export const db = drizzle(client, { schema });
