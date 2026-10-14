export function scheduledHandler(nextWorker) {
  return async (_controller, env, ctx) => {
    if (!env.CRON_SECRET) {
      console.error(JSON.stringify({event:'daily_job_unconfigured'}));
      return;
    }
    ctx.waitUntil((async () => {
      const response = await nextWorker.fetch(new Request('https://cron.internal/api/cron/daily', {
        headers: {Authorization:`Bearer ${env.CRON_SECRET}`},
      }),env,ctx);
      if (!response.ok) throw new Error(`Daily job returned ${response.status}`);
      console.info(JSON.stringify({event:'daily_job_completed',...await response.json()}));
    })());
  };
}
