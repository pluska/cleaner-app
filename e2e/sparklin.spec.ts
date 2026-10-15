import {test, expect} from '@playwright/test';

test('Sparklin answers cleaning questions and loads a small avatar', async ({page}) => {
  const email = `sparklin-${crypto.randomUUID()}@example.invalid`;
  const password = `Quest-${crypto.randomUUID()}-A1`;
  expect((await page.request.post('/api/auth/signup',{data:{email,password}})).status()).toBe(201);
  await page.goto('/auth/login');
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button',{name:/Chat with Sparklin|Hablar con Sparklin/}).click();
  const input = page.getByPlaceholder(/Ask Sparklin|Pregúntale a Sparklin/);
  for (const message of ["I want to clean my laptop, but I'm not sure what to use", 'Can I use it on the keyboard?', 'What about the screen?']) {
    await input.fill(message);
    const responsePromise = page.waitForResponse(r=>r.url().endsWith('/api/sparklin/chat') && r.request().method()==='POST');
    await page.getByRole('button',{name:/Send message|Enviar mensaje/}).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect((await response.json()).intent).toBe('CLEANING');
  }
  await expect(page.getByText(/For your laptop or electronic device/)).toHaveCount(3);
  // Three LORE replies used to be silently replaced by an unrelated client joke.
  for (const message of ['Tell me a dragon story', 'Tell me a castle tale', 'Tell me a wizard legend']) {
    await input.fill(message);
    const responsePromise = page.waitForResponse(r=>r.url().endsWith('/api/sparklin/chat') && r.request().method()==='POST');
    await page.getByRole('button',{name:/Send message|Enviar mensaje/}).click();
    expect((await (await responsePromise).json()).intent).toBe('LORE');
  }
  await expect(page.getByText(/What item or surface are you cleaning/)).toHaveCount(3);
  await expect(page.getByText(/Procrastination Shield|my magic only works/)).toHaveCount(0);
  const avatar = page.locator('img[src="/sparklin/sparklin-avatar.webp"]').first();
  await expect(avatar).toBeVisible();
  await expect.poll(()=>avatar.evaluate((img:HTMLImageElement)=>img.complete && img.naturalWidth)).toBe(128);
  const image = await page.request.get('/sparklin/sparklin-avatar.webp');
  expect((await image.body()).byteLength).toBeLessThan(5000);
});
