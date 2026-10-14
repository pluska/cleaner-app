import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

// Executes production SQL against fresh SQLite; emulates D1's atomic batch semantics.
export function testDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));
  sqlite.exec('PRAGMA foreign_keys=ON');
  class Statement {
    constructor(readonly query:string, readonly values:SQLInputValue[]=[]) {}
    bind(...values:SQLInputValue[]) { return new Statement(this.query,values); }
    execute() { const rows = sqlite.prepare(this.query).all(...this.values); return {success:true,results:rows,meta:{changes:sqlite.prepare('SELECT changes() AS n').get()!.n}}; }
    async all() { return this.execute(); }
    async run() { return this.execute(); }
    async raw() { return this.execute().results.map(row=>Object.values(row)); }
    async first(column?:string) { const row = this.execute().results[0]; return row ? (column ? row[column] : row) : null; }
  }
  const binding = {
    prepare: (sql:string)=>new Statement(sql),
    async batch(statements:Statement[]) {
      sqlite.exec('BEGIN');
      try { const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results; }
      catch(error) {sqlite.exec('ROLLBACK');throw error;}
    },
  } as unknown as D1Database;
  return {sqlite,binding,db:drizzle(binding,{schema}),close:()=>sqlite.close()};
}
export function seedUser(sqlite:DatabaseSync,id='u1') {
  sqlite.prepare('INSERT INTO users(id,email,hashedPassword) VALUES(?,?,?)').run(id,`${id}@example.com`,'old-hash');
  sqlite.prepare('INSERT INTO userProfiles(userId,timezone) VALUES(?,?)').run(id,'UTC');
  sqlite.prepare('INSERT INTO rooms(id,userId,name) VALUES(?,?,?)').run(`room:${id}`,id,'kitchen');
}
export function seedTask(sqlite:DatabaseSync,id='t1',userId='u1',day='2026-10-05') {
  sqlite.prepare('INSERT INTO taskTemplates(id,userId,roomId,title,rrule,startDate) VALUES(?,?,?,?,?,?)').run(id,userId,`room:${userId}`,'Clean','FREQ=WEEKLY',Date.parse(day));
}
