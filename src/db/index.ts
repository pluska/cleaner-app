import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

export function database(): D1Database {
  return getCloudflareContext().env.DB;
}
const binding = new Proxy({} as D1Database, {
  get(_target, property: string) {
    const value = database()[property as keyof D1Database];
    return typeof value === "function" ? value.bind(database()) : value;
  },
});
export const db = drizzle(binding, { schema });
