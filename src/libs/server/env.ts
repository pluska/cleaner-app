import { getCloudflareContext } from '@opennextjs/cloudflare';

// Resolve at request time: secrets are not build-time or browser configuration.
export function serverEnv(name: string): string | undefined {
  try {
    const value: unknown = Reflect.get(getCloudflareContext().env,name);
    if (typeof value === 'string') return value;
  } catch { /* next dev and unit tests use process.env */ }
  return process.env[name];
}
