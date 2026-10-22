// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { seedUser, testDatabase } from '@/test/d1';

let fixture: ReturnType<typeof testDatabase>;
vi.mock('@/db',()=>({database:()=>fixture.binding}));
import { acceptInvitation, createHousehold, getHousehold, inspectInvitation, inviteMember, listHouseholds, removeMember, revokeInvitation, selectHousehold, transferHousehold } from './householdService';

beforeEach(()=>{fixture=testDatabase();for(const user of ['u1','u2','u3'])seedUser(fixture.sqlite,user);});
afterEach(()=>fixture.close());

describe('household membership and invitation boundaries',()=>{
  it('creates an owner atomically, scopes lists and rejects outsiders',async()=>{
    const {id}=await createHousehold('u1','Casa Aurora');
    expect(await listHouseholds('u1')).toMatchObject({activeHouseholdId:id,households:[{id,role:'owner',memberCount:1}]});
    expect((await listHouseholds('u2')).households).toEqual([]);
    await expect(getHousehold('u2',id)).rejects.toMatchObject({status:404});
    await expect(selectHousehold('u2',id)).rejects.toMatchObject({status:404});
    await expect(inviteMember('u2',id,'u3@example.com')).rejects.toMatchObject({status:403});
    await expect(createHousehold('u1',' '.repeat(5))).rejects.toMatchObject({status:400});
  });

  it('stores only a token hash and accepts once for the invited email',async()=>{
    const {id}=await createHousehold('u1','Aurora');
    const invitation=await inviteMember('u1',id,' U2@EXAMPLE.COM ');
    const row=fixture.sqlite.prepare('SELECT * FROM householdInvitations').get()!;
    expect(row.tokenHash).not.toBe(invitation.token);
    expect(JSON.stringify(row)).not.toContain(invitation.token);
    await expect(inspectInvitation('u3',invitation.token)).rejects.toMatchObject({status:410});
    await Promise.all([acceptInvitation('u2',invitation.token),acceptInvitation('u2',invitation.token)]);
    expect((await getHousehold('u2',id)).members).toHaveLength(2);
    expect((await getHousehold('u2',id)).invitations).toEqual([]);
    expect((await listHouseholds('u2')).activeHouseholdId).toBe(id);
    await acceptInvitation('u2',invitation.token);
    expect((await getHousehold('u1',id)).members).toHaveLength(2);
  });

  it('rejects revoked, expired, malformed and already-used invitations',async()=>{
    const {id}=await createHousehold('u1','Aurora');
    const revoked=await inviteMember('u1',id,'u2@example.com');
    await revokeInvitation('u1',id,revoked.id);
    await expect(acceptInvitation('u2',revoked.token)).rejects.toMatchObject({status:410});
    const expired=await inviteMember('u1',id,'u2@example.com');
    fixture.sqlite.prepare('UPDATE householdInvitations SET createdAt=1,expiresAt=2 WHERE id=?').run(expired.id);
    await expect(acceptInvitation('u2',expired.token)).rejects.toMatchObject({status:410});
    await expect(inspectInvitation('u2','bad')).rejects.toMatchObject({status:410});
    const accepted=await inviteMember('u1',id,'u2@example.com');
    await acceptInvitation('u2',accepted.token);
    await removeMember('u1',id,'u2');
    await expect(acceptInvitation('u2',accepted.token)).rejects.toMatchObject({status:410});
    expect((await listHouseholds('u2')).activeHouseholdId).toBeNull();
  });

  it('rolls back the invitation claim if membership creation fails',async()=>{
    const {id}=await createHousehold('u1','Aurora'),invite=await inviteMember('u1',id,'u2@example.com');
    fixture.sqlite.exec("CREATE TRIGGER reject_test_member BEFORE INSERT ON householdMembers WHEN NEW.userId='u2' BEGIN SELECT RAISE(ABORT,'test'); END");
    await expect(acceptInvitation('u2',invite.token)).rejects.toThrow();
    expect(fixture.sqlite.prepare('SELECT acceptedAt FROM householdInvitations WHERE id=?').get(invite.id)!.acceptedAt).toBeNull();
    fixture.sqlite.exec('DROP TRIGGER reject_test_member');
    await acceptInvitation('u2',invite.token);
    expect((await getHousehold('u2',id)).role).toBe('member');
  });

  it('enforces owner actions, transfer and removal without losing personal data',async()=>{
    const {id}=await createHousehold('u1','Aurora');
    await acceptInvitation('u2',(await inviteMember('u1',id,'u2@example.com')).token);
    await expect(removeMember('u1',id,'u1')).rejects.toMatchObject({status:403});
    await expect(removeMember('u2',id,'u1')).rejects.toMatchObject({status:403});
    await expect(transferHousehold('u2',id,'u2')).rejects.toMatchObject({status:403});
    await expect(transferHousehold('u1',id,'u3')).rejects.toMatchObject({status:403});
    await expect(inviteMember('u2',id,'u3@example.com')).rejects.toMatchObject({status:403});
    const staleInvite=await inviteMember('u1',id,'u3@example.com');
    await transferHousehold('u1',id,'u2');
    expect((await getHousehold('u2',id)).role).toBe('owner');
    expect((await getHousehold('u2',id)).invitations.find(i=>i.id===staleInvite.id)?.revokedAt).not.toBeNull();
    await expect(acceptInvitation('u3',staleInvite.token)).rejects.toMatchObject({status:410});
    await removeMember('u1',id,'u1');
    expect(fixture.sqlite.prepare('SELECT coins FROM userProfiles WHERE userId=?').get('u1')).toBeTruthy();
    await expect(getHousehold('u1',id)).rejects.toMatchObject({status:404});
    expect((await getHousehold('u2',id)).members).toHaveLength(1);
  });

  it('persists independent active households and enforces ownership in the database',async()=>{
    const one=await createHousehold('u1','One'),two=await createHousehold('u1','Two');
    await selectHousehold('u1',one.id);
    expect((await listHouseholds('u1')).activeHouseholdId).toBe(one.id);
    expect((await listHouseholds('u2')).activeHouseholdId).toBeNull();
    expect(()=>fixture.sqlite.prepare('DELETE FROM householdMembers WHERE householdId=? AND userId=?').run(two.id,'u1')).toThrow('household_owner_cannot_leave');
    expect(()=>fixture.sqlite.prepare('INSERT INTO householdPreferences(userId,householdId) VALUES(?,?)').run('u2',one.id)).toThrow();
    expect(()=>fixture.sqlite.prepare('UPDATE households SET ownerId=? WHERE id=?').run('u3',one.id)).toThrow('household_owner_must_be_member');
  });
});
