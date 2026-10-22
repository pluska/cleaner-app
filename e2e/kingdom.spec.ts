import { test, expect } from '@playwright/test';

// Real local D1 and Auth.js; only test data preparation uses HTTP APIs.
test('mission → rewards → upgrade → persisted kingdom', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const artwork = new Map<string, number>();
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (path.startsWith('/kingdom/') && /\.(webp|svg)$/.test(path)) artwork.set(path, response.status());
  });
  const email = `kingdom-e2e-${crypto.randomUUID()}@example.invalid`;
  const password = `Quest-${crypto.randomUUID()}-A1`;
  const signup = await page.request.post('/api/auth/signup', { data: { email, password } });
  expect(signup.status()).toBe(201);
  await page.goto('/auth/login');
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/dashboard/);
  const kingdom = async () => {
    const response = await page.request.get('/api/kingdom');
    expect(response.ok()).toBeTruthy();
    return response.json();
  };
  const before = await kingdom();
  const roomResponse = await page.request.post('/api/user/areas', { data: { area_name: 'Cocina E2E', area_type: 'kitchen' } });
  expect(roomResponse.status()).toBe(201);
  const { area } = await roomResponse.json();
  const taskResponse = await page.request.post('/api/tasks', { data: {
    title: 'Restaurar la mesa de la taberna', description: 'Despeja y limpia la mesa.',
    roomId: area.id, frequency: 'once', startDate: before.today, importanceLevel: 5,
  } });
  expect(taskResponse.status()).toBe(201);
  const { task } = await taskResponse.json();
  await page.goto('/kingdom');
  await expect(page.getByRole('heading', { name: 'Un hogar que florece.' })).toBeVisible();
  await expect(page.locator('.kingdom-canvas canvas')).toBeVisible();
  await expect(page.locator('.kingdom-canvas')).toHaveAttribute('data-scene-state', 'ready');
  await expect.poll(() => page.locator('.kingdom-canvas').evaluate(element => JSON.parse((element as HTMLElement).dataset.renderedBuildings || '[]').length)).toBe(4);
  for (const name of ['terrain.webp', 'tower1.webp', 'tower2.webp', 'tower3.webp', 'tavern3d.webp', 'well3d.webp', 'gate3d.webp', 'household-banner.svg', 'sparklin.webp']) {
    await expect.poll(() => artwork.get(`/kingdom/${name}`)).toBe(200);
  }
  const rendered: {asset:string;width:number;height:number;sourceWidth:number;sourceHeight:number}[] = await page.locator('.kingdom-canvas').evaluate(element => JSON.parse((element as HTMLElement).dataset.renderedBuildings || '[]'));
  expect(rendered.map(item => item.asset).sort()).toEqual(['/kingdom/tower1.webp', '/kingdom/tavern3d.webp', '/kingdom/well3d.webp', '/kingdom/gate3d.webp'].sort());
  for (const item of rendered) {
    expect(item.width).toBeGreaterThan(0);
    expect(Math.abs(item.width / item.height - item.sourceWidth / item.sourceHeight)).toBeLessThan(.001);
  }
  await expect(page.getByRole('heading', { name: task.title })).toBeVisible();
  await page.getByRole('button', { name: '5 min', exact: true }).click();
  await expect(page.getByText('Sin misiones pendientes para esta selección.')).toBeVisible();
  await page.getByRole('button', { name: '20 min', exact: true }).click();
  await page.getByText('Edificios y habitaciones', { exact: true }).click();
  await page.getByRole('button', { name: 'Taberna Nv. 1' }).click();
  await expect(page.getByRole('heading', { name: task.title })).toBeVisible();
  // Wait for all scene textures as well as the mounted canvas before visual evidence.
  await expect.poll(() => page.evaluate(() => Array.from(document.images).every(i => i.complete))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('kingdom-before.png'), fullPage: true });
  await page.getByRole('button', { name: 'Comenzar misión' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', {name:'Ya terminé'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', {name:'Comenzar misión'}).click();
  await page.getByRole('button', { name: 'Ya terminé' }).click();
  await expect(page.getByRole('status')).toContainText('+25 XP · +5 monedas');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const after = await kingdom();
  expect(after.profile.xp - before.profile.xp).toBe(25);
  expect(after.profile.coins - before.profile.coins).toBe(5);
  expect(after.campaign.completed).toBe(1);
  expect(after.weekly.completed).toBe(1);
  expect(after.buildings.find((b: { kind: string }) => b.kind === 'TAVERN').corruption).toBe(0);
  // Retrying the same completion must never mint another reward.
  expect((await page.request.post(`/api/tasks/${task.id}/complete`, { data: { dueDate: before.today } })).ok()).toBeTruthy();
  expect((await kingdom()).profile).toEqual(after.profile);
  await page.getByRole('button', { name: 'Mejorar · 4 monedas' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 2 · Restaurado' })).toBeVisible();
  expect((await kingdom()).profile.coins).toBe(after.profile.coins - 4);
  await page.getByRole('button', { name: 'Descanso', exact: true }).click();
  await expect(page.getByText('El reino descansa contigo.')).toBeVisible();
  await page.getByRole('button', { name: 'Mover edificios' }).click();
  await page.getByRole('button', {name:'Avanzar X'}).click();
  await page.getByRole('button', { name: 'Guardar aldea' }).click();
  await expect(page.getByRole('status')).toHaveText('Aldea guardada');
  const saved=await kingdom();
  expect(saved.version).toBe(before.version + 1);
  expect(saved.buildings.find((b:{kind:string})=>b.kind==='TAVERN').x).toBe(4);
  await page.reload();
  await expect(page.getByText('El reino descansa contigo.')).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Campaña', exact: true })).toHaveAttribute('value', '1');
  await page.getByText('Edificios y habitaciones', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Taberna Nv. 2' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('kingdom-after.png'), fullPage: true });
  // Earn upgrades through real completions, then verify the rendered tower tiers.
  for (let index = 0; index < 4; index++) {
    const response = await page.request.post('/api/tasks', { data: {
      title: `Misión de arte ${index + 1}`, roomId: area.id, frequency: 'once',
      startDate: before.today, importanceLevel: 5,
    } });
    expect(response.status()).toBe(201);
    const { task: extra } = await response.json();
    expect((await page.request.post(`/api/tasks/${extra.id}/complete`, { data: { dueDate: before.today } })).ok()).toBe(true);
  }
  await page.reload();
  await page.getByText('Edificios y habitaciones', { exact: true }).click();
  await page.getByRole('button', { name: 'Torre de Sparklin Nv. 1' }).click();
  for (const level of [2, 3]) {
    await page.getByRole('button', { name: `Mejorar · ${(level - 1) * 4} monedas` }).click();
    await expect(page.getByRole('heading', { name: new RegExp(`^Nivel ${level} ·`) })).toBeVisible();
    await expect.poll(() => page.locator('.kingdom-canvas').evaluate(element =>
      JSON.parse((element as HTMLElement).dataset.renderedBuildings || '[]').find((building: {id:string}) => building.id.endsWith(':TOWER'))?.asset
    )).toBe(`/kingdom/tower${level}.webp`);
  }
  await expect(page.getByText('Estandarte semanal desbloqueado', { exact: true })).toBeVisible();
  expect((await kingdom()).buildings.find((b: {kind:string}) => b.kind === 'TOWER').level).toBe(3);
  await page.screenshot({ path: testInfo.outputPath('kingdom-tower3.png'), fullPage: true });
  expect(errors).toEqual([]);
});
