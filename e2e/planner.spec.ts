import {test,expect} from '@playwright/test';

test('signup → onboarding → saved task → calendar → real statistics', async ({page},testInfo) => {
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/auth/signup');
  await page.locator('input[type=email]').fill(`planner-e2e-${crypto.randomUUID()}@example.invalid`);
  await page.locator('input[type=password]').fill(`Quest-${crypto.randomUUID()}-A1`);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByPlaceholder('Your hero name').fill('Planner Hero');
  for(let i=0;i<5;i++) await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Finish',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard/,{timeout:30000});
  await expect(page.getByText(/Planner Hero/).first()).toBeVisible();
  const assessment=await (await page.request.get('/api/user/home-assessment')).json();
  expect(assessment.assessment.cleaningPreferences).toBe(2);
  const areas=await (await page.request.get('/api/user/areas')).json();
  expect(areas.areas).toHaveLength(4);
  const kingdom=await (await page.request.get('/api/kingdom')).json();
  const title='Manual task saved from the form';
  await page.getByRole('link',{name:'Add Task',exact:true}).click();
  await page.getByLabel('Task title').fill(title);
  await page.getByLabel('Room',{exact:true}).selectOption(areas.areas[0].id);
  await page.getByLabel('Due Date').fill(kingdom.today);
  await page.getByRole('button',{name:'Add Task',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard\?date=/);
  // Scroll the task list; the manually created task follows the initial suggestions.
  await expect.poll(async()=>{
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    return page.getByText(title,{exact:true}).count();
  }).toBe(1);
  const card=page.getByText(title,{exact:true}).locator('..').locator('..');
  await card.getByRole('button',{name:/Complete/}).click();
  await expect(card.getByRole('button',{name:/Complete/})).toBeDisabled();
  await page.reload();
  const tasks=await (await page.request.get(`/api/tasks?date=${kingdom.today}`)).json();
  expect(tasks.tasks.find((t:{title:string})=>t.title===title).completed).toBe(true);
  await page.goto('/schedule');
  const month=kingdom.today.slice(0,7);
  const day=page.getByRole('button',{name:new RegExp(`^${kingdom.today}`)});
  await expect(day).toHaveAttribute('aria-label',new RegExp('1/'));
  await day.click();
  await expect(page).toHaveURL(new RegExp(`date=${kingdom.today}`));
  const summary=await (await page.request.get('/api/user/weekly-activity')).json();
  expect(summary.summary.completedTasks).toBe(1);
  expect(summary.summary.totalXp).toBe(15);
  await page.goto('/stats');
  await expect(page.getByText('Level 1',{exact:true})).toBeVisible();
  await page.getByLabel('Week',{exact:true}).selectOption('1');
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath(`stats-${month}.png`),fullPage:true});
  await page.goto('/store');
  await expect(page.getByText('1 Hour Video Games')).toBeVisible();
  await expect(page.getByRole('alert').filter({hasText:/\S/})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('protected onboarding redirects anonymous users to login',async({page})=>{
  await page.goto('/onboarding');
  await expect(page).toHaveURL(/\/auth\/login/);
});
