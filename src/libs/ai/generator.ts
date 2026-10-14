import 'server-only';
import OpenAI from 'openai';
import { z } from 'zod';
import { serverEnv } from '@/libs/server/env';
import { reserveAiUsage } from '@/libs/server/security';

export async function generateStructured<T>(options: {
  userId:string; prompt:string; input:unknown; schema:z.ZodType<T>; name:string;
  validate:(value:T)=>boolean; fallback:()=>T;
}): Promise<{value:T;source:'openai'|'fallback'}> {
  const fallback = (reason:string) => {
    console.info(JSON.stringify({event:'ai_fallback',reason}));
    return {value:options.fallback(),source:'fallback' as const};
  };
  const key = serverEnv('OPENAI_API_KEY');
  if (!key || serverEnv('AI_DISABLED') === 'true') return fallback('unavailable');
  // One reservation covers a primary attempt and at most one correction.
  await reserveAiUsage(options.userId);
  const client = new OpenAI({apiKey:key,maxRetries:0,timeout:30_000});
  const signal = AbortSignal.timeout(30_000);
  const started = Date.now();
  const schema = z.toJSONSchema(options.schema);
  delete schema.$schema;
  const models = [serverEnv('OPENAI_MODEL') || 'gpt-4o-mini',serverEnv('OPENAI_FALLBACK_MODEL') || 'gpt-4o'];
  for (let attempt=0;attempt<2;attempt++) {
    try {
      const result = await client.responses.create({
        model:models[attempt],store:false,max_output_tokens:options.name==='cleaning_tasks'?6000:1200,
        instructions:options.prompt,
        input:JSON.stringify({request:options.input,...(attempt ? {correction:'Previous output failed schema or room validation. Follow the schema and use only the supplied rooms.'} : {})}),
        text:{format:{type:'json_schema',name:options.name,strict:true,schema}},
      },{signal});
      console.info(JSON.stringify({event:'ai_response',model:models[attempt],attempt,latencyMs:Date.now()-started,inputTokens:result.usage?.input_tokens,outputTokens:result.usage?.output_tokens}));
      if (result.status !== 'completed' || result.output.some(item=>item.type==='message' && item.content.some(c=>c.type==='refusal'))) return fallback('refusal_or_incomplete');
      let parsed: unknown;
      try { parsed = JSON.parse(result.output_text); } catch { continue; }
      const valid = options.schema.safeParse(parsed);
      if (valid.success && options.validate(valid.data)) return {value:valid.data,source:'openai'};
    } catch {
      console.warn(JSON.stringify({event:'ai_fallback',attempt,latencyMs:Date.now()-started}));
      return fallback('provider_failure');
    }
  }
  return fallback('invalid_output');
}
