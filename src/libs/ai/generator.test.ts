// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bilingualSchema } from './schemas';
const {create,reserve,environment,constructor}=vi.hoisted(()=>({create:vi.fn(),reserve:vi.fn(),environment:{OPENAI_API_KEY:'test',AI_DISABLED:'false'} as Record<string,string>,constructor:vi.fn()}));
vi.mock('openai',()=>({default:class {responses={create};constructor(options:unknown){constructor(options);}}}));
vi.mock('@/libs/server/env',()=>({serverEnv:(key:string)=>environment[key]}));
vi.mock('@/libs/server/security',()=>({reserveAiUsage:reserve}));
import {generateStructured} from './generator';
const options={userId:'u1',prompt:'Sparklin',input:{message:'hello'},schema:bilingualSchema,name:'sparklin',validate:()=>true,fallback:()=>({en:'Fallback',es:'Respaldo'})};
const response=(value:unknown)=>({status:'completed',output:[],output_text:JSON.stringify(value),usage:{input_tokens:5,output_tokens:5}});
beforeEach(()=>{vi.clearAllMocks();environment.AI_DISABLED='false';environment.OPENAI_API_KEY='test';reserve.mockResolvedValue(undefined);});
describe('GPT orchestration',()=>{
 it('accepts plain structured JSON, disables storage/retries and reserves quota',async()=>{
  create.mockResolvedValueOnce(response({en:'Hello',es:'Hola'}));
  expect((await generateStructured(options)).source).toBe('openai');
  expect(create).toHaveBeenCalledWith(expect.objectContaining({model:'gpt-4o-mini',store:false,text:{format:expect.objectContaining({strict:true,type:'json_schema'})}}),expect.objectContaining({signal:expect.any(AbortSignal)}));
  expect(constructor).toHaveBeenCalledWith(expect.objectContaining({maxRetries:0,timeout:30000}));
  expect(reserve).toHaveBeenCalledTimes(1);
 });
 it('makes exactly one correction and shares the deadline',async()=>{
  create.mockResolvedValueOnce(response({en:'Missing Spanish'})).mockResolvedValueOnce(response({en:'Hello',es:'Hola'}));
  expect((await generateStructured(options)).source).toBe('openai');
  expect(create.mock.calls[1][0].model).toBe('gpt-4o');
  expect(create.mock.calls[0][1].signal).toBe(create.mock.calls[1][1].signal);
 });
 it('falls back after a second invalid result',async()=>{
  create.mockResolvedValue(response({en:'Incomplete'}));
  expect((await generateStructured(options)).source).toBe('fallback');expect(create).toHaveBeenCalledTimes(2);
 });
 it.each(['provider error','timeout'])('falls back on %s without retry',async()=>{
  create.mockRejectedValueOnce(new Error('failure'));expect((await generateStructured(options)).source).toBe('fallback');expect(create).toHaveBeenCalledTimes(1);
 });
 it('does not retry refusals',async()=>{
  create.mockResolvedValueOnce({status:'completed',output:[{type:'message',content:[{type:'refusal'}]}]});expect((await generateStructured(options)).source).toBe('fallback');expect(create).toHaveBeenCalledTimes(1);
 });
 it.each(['disabled','missing key'])('uses static content with no quota or provider call when %s',async(mode)=>{
  if(mode==='disabled')environment.AI_DISABLED='true';else delete environment.OPENAI_API_KEY;
  expect((await generateStructured(options)).source).toBe('fallback');expect(reserve).not.toHaveBeenCalled();expect(create).not.toHaveBeenCalled();
 });
 it('blocks the provider when quota fails',async()=>{reserve.mockRejectedValueOnce(new Error('Limit unavailable'));await expect(generateStructured(options)).rejects.toThrow();expect(create).not.toHaveBeenCalled();});
 it('corrects business-rule failures',async()=>{create.mockResolvedValueOnce(response({en:'Bad',es:'Malo'})).mockResolvedValueOnce(response({en:'Good',es:'Bueno'}));expect((await generateStructured({...options,validate:v=>v.en==='Good'})).value.en).toBe('Good');});
});
