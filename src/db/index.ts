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
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/9ba2b04bf514d9facfd57ed57d849e77241a7adc99d1c1545d06688b43d84248.sqlite",
  });
}

export const db = drizzle(client, { schema });
