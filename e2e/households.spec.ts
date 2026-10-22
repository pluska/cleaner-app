import { test, expect, type Page } from '@playwright/test';

async function login(page:Page,email:string,password:string){
  await page.goto('/auth/login');
  await page.getByLabel('Email',{exact:true}).fill(email);
  await page.getByLabel('Password',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Sign In',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('owner invites a real account, switches households, revokes and removes access',async({page,browser},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const password=`Quest-${crypto.randomUUID()}-A1`;
  const ownerEmail=`owner-${crypto.randomUUID()}@example.invalid`,memberEmail=`member-${crypto.randomUUID()}@example.invalid`;
  for(const email of [ownerEmail,memberEmail])expect((await page.request.post('/api/auth/signup',{data:{email,password}})).status()).toBe(201);
  await login(page,ownerEmail,password);
  expect((await page.request.patch('/api/user/hero-name',{data:{name:'Andrés'}})).ok()).toBe(true);
  await page.goto('/households');
  await page.getByLabel('Household name',{exact:true}).fill('Casa Aurora');
  await page.getByRole('button',{name:'Create household',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Your camaradas',exact:true})).toBeVisible();
  await page.getByLabel('Member email',{exact:true}).fill(memberEmail);
  await page.getByRole('button',{name:'Invite member',exact:true}).click();
  await expect(page.getByLabel('Link',{exact:true})).toHaveValue(/token=/);
  const invitationLink=await page.getByLabel('Link',{exact:true}).inputValue();
  const token=new URL(invitationLink).searchParams.get('token')!;
  const ownerList=await (await page.request.get('/api/households')).json(),id=ownerList.activeHouseholdId;
  expect((await page.request.post('/api/households',{headers:{origin:'https://unrelated.invalid'},data:{name:'Forbidden'}})).status()).toBe(403);
  const detail=await (await page.request.get(`/api/households/${id}`)).json();
  expect(JSON.stringify(detail)).not.toContain(token);
  await page.screenshot({path:testInfo.outputPath('owner-invitation.png'),fullPage:true});

  const memberContext=await browser.newContext({viewport:page.viewportSize()??undefined});
  const member=await memberContext.newPage();member.on('pageerror',e=>errors.push(e.message));
  try{
    // Public review preserves the invitation through the actual login form.
    await member.goto(invitationLink);
    await member.getByRole('link',{name:'Sign In',exact:true}).click();
    await member.getByLabel('Email',{exact:true}).fill(memberEmail);
    await member.getByLabel('Password',{exact:true}).fill(password);
    await member.getByRole('button',{name:'Sign In',exact:true}).click();
    await expect(member).toHaveURL(/\/households\/join\?token=/);
    expect((await member.request.patch('/api/user/hero-name',{data:{name:'Lucía'}})).ok()).toBe(true);
    await member.getByRole('button',{name:'Join household',exact:true}).click();
    await expect(member).toHaveURL(/\/households$/);
    await expect(member.getByRole('heading',{name:'Your camaradas',exact:true})).toBeVisible();
    await expect(member.getByRole('button',{name:'Invite member',exact:true})).toHaveCount(0);
    expect((await member.request.post(`/api/households/${id}/invitations`,{data:{email:ownerEmail}})).status()).toBe(403);
    await page.reload();await expect(page.locator('.household-member')).toHaveCount(2);

    await page.getByLabel('Household name',{exact:true}).fill('Depa del centro');
    await page.getByRole('button',{name:'Create household',exact:true}).click();
    await expect(page.locator('.household-choice')).toHaveCount(2);
    await expect.poll(async()=>(await (await page.request.get('/api/households')).json()).activeHouseholdId).not.toBe(id);
    const second=(await (await page.request.get('/api/households')).json()).activeHouseholdId;
    expect((await member.request.get(`/api/households/${second}`)).status()).toBe(404);
    expect((await (await member.request.get('/api/households')).json()).activeHouseholdId).toBe(id);
    await page.locator('.household-choice').filter({hasText:'Casa Aurora'}).click();
    await expect(page.locator('.household-member')).toHaveCount(2);
    await page.getByLabel('Member email',{exact:true}).fill(memberEmail);
    await page.getByRole('button',{name:'Invite member',exact:true}).click();
    await expect(page.getByLabel('Link',{exact:true})).toHaveValue(/token=/);
    const revokedToken=new URL(await page.getByLabel('Link',{exact:true}).inputValue()).searchParams.get('token');
    await page.getByRole('button',{name:'Cancel invitation',exact:true}).click();
    await expect(page.getByText('Cancelled',{exact:true})).toBeVisible();
    expect((await member.request.post('/api/households/join',{data:{token:revokedToken}})).status()).toBe(410);
    await page.getByRole('button',{name:'Remove member',exact:true}).click();
    await page.getByRole('button',{name:'Confirm',exact:true}).click();
    await expect(page.locator('.household-member')).toHaveCount(1);
    expect((await member.request.get(`/api/households/${id}`)).status()).toBe(404);
    expect((await member.request.post('/api/households/join',{data:{token}})).status()).toBe(410);
    expect((await member.request.get('/api/user/profile')).status()).toBe(200);
    await member.reload();await expect(member.getByText('You can start on your own',{exact:true})).toBeVisible();
    await page.evaluate(()=>localStorage.setItem('language','es'));
    await page.reload();await expect(page.getByRole('heading',{name:'Tus camaradas',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath('households.png'),fullPage:true});
    expect(errors).toEqual([]);
  }finally{await memberContext.close();}
});

test('canonical favicon and anonymous household protection',async({page})=>{
  const icon=await page.request.get('/favicon.ico');
  expect(icon.status()).toBe(200);expect(icon.headers()['content-type']).toContain('image/');
  expect((await icon.body()).byteLength).toBeGreaterThan(100);
  expect((await page.request.get('/api/households')).status()).toBe(401);
  await page.goto('/households');await expect(page).toHaveURL(/\/auth\/login/);
});
