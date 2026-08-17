import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  transaction: vi.fn(),
  select: vi.fn(),
}));

vi.mock('../../db/connection.js', () => ({
  db: {
    execute: mocks.execute,
    transaction: mocks.transaction,
    select: mocks.select,
  },
}));

import { normalizeCareerTitle, taxonomyRouter } from './taxonomy.js';

const standardUser = {
  userId: '2e8d7a31-afb7-4aa6-8984-7312dac14368',
  email: 'person@example.com',
  accessLevel: 'standard' as const,
};
const adminUser = { ...standardUser, accessLevel: 'admin' as const };

type TestUser = Omit<typeof standardUser, 'accessLevel'> & {
  accessLevel: 'standard' | 'admin';
};

function caller(_clientIp: string, user: TestUser | null = null) {
  return taxonomyRouter.createCaller({ user, session: {} });
}

function candidate(name: string, slug: string) {
  return {
    id: crypto.randomUUID(),
    name,
    slug,
    seniority: 'mid' as const,
    familyId: crypto.randomUUID(),
    familyName: 'Test family',
    score: 1,
  };
}

describe('career taxonomy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists active career families without a session', async () => {
    const families = [{ id: crypto.randomUUID(), slug: 'agriculture', name: 'Agriculture' }];
    mocks.select.mockReturnValueOnce({
      from: () => ({ where: () => ({ orderBy: vi.fn().mockResolvedValue(families) }) }),
    });

    await expect(caller('public-list').listFamilies()).resolves.toEqual(families);
  });

  it.each([
    ['  Bursar  ', 'Accountant', 'accountant'],
    ['Camp Manager', 'Camp Manager', 'camp-manager'],
    ['Marketeer', 'Sales Representative', 'sales-representative'],
  ])('resolves the Zambian title %s while preserving the person’s own words', async (ownTitle, name, slug) => {
    mocks.execute.mockResolvedValueOnce({ rows: [candidate(name, slug)] });

    const result = await caller(`local-${slug}`).resolveTitle({ title: ownTitle });

    expect(result.ownTitle).toBe(ownTitle);
    expect(result.candidates[0]).toMatchObject({ name, slug });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('returns no guess for an unrecognised title and emits an anonymous backlog event', async () => {
    mocks.execute.mockResolvedValueOnce({ rows: [] });
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const result = await caller('unrecognised').resolveTitle({ title: 'qwertyuiop' });

    expect(result).toMatchObject({
      ownTitle: 'qwertyuiop',
      normalizedTitle: 'qwertyuiop',
      candidates: [],
    });
    expect(info).toHaveBeenCalledWith(expect.stringContaining('taxonomy.title.unresolved'));
    expect(info.mock.calls[0]?.[0]).not.toContain(standardUser.userId);
    info.mockRestore();
  });

  it('rejects unbounded title input before querying', async () => {
    await expect(
      caller('oversized').resolveTitle({ title: 'x'.repeat(10_000) }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('rejects a standard user attempting an admin write', async () => {
    await expect(caller('standard', standardUser).supersedeRole({
      roleId: crypto.randomUUID(),
      slug: 'new-role',
      name: 'New role',
      seniority: 'mid',
    })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('supersedes instead of deleting and writes the before/after audit row', async () => {
    const roleId = crypto.randomUUID();
    const before = {
      id: roleId,
      familyId: crypto.randomUUID(),
      slug: 'accountant',
      name: 'Accountant',
      seniority: 'mid' as const,
      version: 1,
      active: true,
      supersedesId: null,
      createdAt: new Date(),
    };
    const after = {
      ...before,
      id: crypto.randomUUID(),
      name: 'Senior Accountant',
      slug: 'senior-accountant',
      seniority: 'senior' as const,
      version: 2,
      supersedesId: before.id,
    };
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const auditValues = vi.fn().mockResolvedValue(undefined);
    let insertNumber = 0;
    const tx = {
      select: () => ({
        from: () => ({ where: () => ({ limit: vi.fn().mockResolvedValue([before]) }) }),
      }),
      update: () => ({ set: () => ({ where: updateWhere }) }),
      insert: () => {
        insertNumber += 1;
        return insertNumber === 1
          ? { values: () => ({ returning: vi.fn().mockResolvedValue([after]) }) }
          : { values: auditValues };
      },
    };
    mocks.transaction.mockImplementationOnce(async (operation) => operation(tx));

    await expect(caller('admin', adminUser).supersedeRole({
      roleId,
      slug: after.slug,
      name: after.name,
      seniority: after.seniority,
    })).resolves.toEqual(after);

    expect(updateWhere).toHaveBeenCalledOnce();
    expect(auditValues).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: adminUser.userId,
      action: 'taxonomy.role.superseded',
      entityType: 'career_role',
      before,
      after,
    }));
  });

  it('normalises punctuation and spacing without changing the submitted title', () => {
    expect(normalizeCareerTitle('  Senior—BURSAR  ')).toBe('senior bursar');
  });
});
