// @vitest-environment node
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { testDatabase, seedUser, seedTask } from '@/test/d1';
const state = vi.hoisted(() => ({fixture:undefined as unknown}));
vi.mock('@/db', () => ({database: () => (state.fixture as ReturnType<typeof testDatabase>).binding}));
import { GET } from './route';
let fixture:ReturnType<typeof testDatabase>;
beforeEach(() => {fixture=testDatabase();state.fixture=fixture;seedUser(fixture.sqlite);seedTask(fixture.sqlite);vi.stubEnv('CRON_SECRET','test-secret');vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));});
afterEach(() => {fixture.close();vi.unstubAllEnvs();vi.useRealTimers();});
const request = () => new Request('http://localhost/api/cron/daily',{headers:{Authorization:'Bearer test-secret'}});
it('fails closed when the cron secret is missing',async () => {vi.stubEnv('CRON_SECRET','');expect((await GET(request())).status).toBe(503);});
it('rejects missing or incorrect authorization',async () => {expect((await GET(new Request('http://localhost'))).status).toBe(401);});
it('advances a cursor once under concurrency and clears exhausted one-time rules',async () => {
 fixture.sqlite.prepare("UPDATE taskTemplates SET rrule='FREQ=DAILY;COUNT=1',nextOccurrence=startDate WHERE id='t1'").run();
 fixture.sqlite.exec("UPDATE userProfiles SET currentStreak=5,lastActivityDate='2026-10-01'");
 const responses=await Promise.all([GET(request()),GET(request())]);
 expect(responses.every(r=>r.status===200)).toBe(true);
 expect(fixture.sqlite.prepare('SELECT COUNT(*) AS n FROM taskInstances').get()!.n).toBe(1);
 expect(fixture.sqlite.prepare('SELECT nextOccurrence FROM taskTemplates').get()!.nextOccurrence).toBeNull();
 expect(fixture.sqlite.prepare('SELECT currentStreak FROM userProfiles').get()!.currentStreak).toBe(0);
});
it('uses the user calendar date, respects end dates and keeps resting streaks',async () => {
 fixture.sqlite.exec("UPDATE userProfiles SET timezone='America/Lima',currentStreak=5,resting=1,lastActivityDate='2026-10-01'");
 fixture.sqlite.prepare('UPDATE taskTemplates SET startDate=?,nextOccurrence=?,endDate=?').run(Date.parse('2026-10-05T02:00:00Z'),Date.parse('2026-10-05T02:00:00Z'),Date.parse('2026-10-06T02:00:00Z'));
 expect((await GET(request())).status).toBe(200);
 expect(fixture.sqlite.prepare('SELECT dueDate FROM taskInstances').get()!.dueDate).toBe('2026-10-04');
 expect(fixture.sqlite.prepare('SELECT nextOccurrence FROM taskTemplates').get()!.nextOccurrence).toBeNull();
 expect(fixture.sqlite.prepare('SELECT currentStreak FROM userProfiles').get()!.currentStreak).toBe(5);
});
