import nextWorker from './.open-next/worker.js';
import {scheduledHandler} from './worker-schedule.mjs';

// OpenNext handles HTTP; Wrangler's configured Cron Trigger needs a scheduled handler.
export default {...nextWorker, scheduled:scheduledHandler(nextWorker)};
