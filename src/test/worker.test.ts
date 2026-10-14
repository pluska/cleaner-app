// @vitest-environment node
import {it,expect,vi,beforeEach} from 'vitest';
const {fetchNext}=vi.hoisted(()=>({fetchNext:vi.fn()}));
import {scheduledHandler} from '../../worker-schedule.mjs';
const worker={scheduled:scheduledHandler({fetch:fetchNext})};
beforeEach(()=>{vi.clearAllMocks();});
it('routes scheduled work through the authenticated HTTP handler and attaches its lifetime',async()=>{
 fetchNext.mockResolvedValue(Response.json({success:true}));
 const waitUntil=vi.fn();
 await worker.scheduled({}, {CRON_SECRET:'synthetic-secret'}, {waitUntil});
 expect(waitUntil).toHaveBeenCalledTimes(1);
 await waitUntil.mock.calls[0][0];
 const [request]=fetchNext.mock.calls[0];
 expect(request.url).toBe('https://cron.internal/api/cron/daily');
 expect(request.headers.get('authorization')).toBe('Bearer synthetic-secret');
});
it('does not execute an unconfigured scheduled job',async()=>{
 await worker.scheduled({}, {}, {waitUntil:vi.fn()});
 expect(fetchNext).not.toHaveBeenCalled();
});
