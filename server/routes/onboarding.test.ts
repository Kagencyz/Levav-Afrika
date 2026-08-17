import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('../../db/connection.js', () => ({ db: mocks }));

import { onboardingRouter } from './onboarding.js';

const userA = {
  userId: '2e8d7a31-afb7-4aa6-8984-7312dac14368',
  email: 'a@example.com',
  accessLevel: 'standard' as const,
};
const userB = { ...userA, userId: 'd3818fc0-8a40-488b-a2e3-c3cfbb6836ad', email: 'b@example.com' };

const caller = (user = userA) => onboardingRouter.createCaller({ user, session: {} });

function selectResult(rows: unknown[]) {
  return { from: () => ({ where: () => ({ limit: vi.fn().mockResolvedValue(rows) }) }) };
}

function mockInsert(result: Record<string, unknown>) {
  const values = vi.fn((_input: Record<string, unknown>) => ({ returning: vi.fn().mockResolvedValue([result]) }));
  mocks.insert.mockReturnValueOnce({ values });
  return values;
}

describe('intelligent onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  it('allows all three preference axes to remain unspecified', async () => {
    mocks.select.mockReturnValueOnce(selectResult([]));
    const values = mockInsert({
      userId: userA.userId,
      intentions: [],
      employmentSituation: null,
      opportunityPosture: null,
    });

    await caller().complete({
      intentions: [],
      employmentSituation: null,
      opportunityPosture: null,
    });

    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      userId: userA.userId,
      intentions: [],
      primaryIntention: null,
      employmentSituation: null,
      opportunityPosture: null,
    }));
  });

  it('records hire as an intention and grants no membership, role or entitlement', async () => {
    mocks.select.mockReturnValueOnce(selectResult([]));
    const values = mockInsert({ userId: userA.userId, intentions: ['hire'] });

    await caller().complete({
      intentions: ['hire'],
      employmentSituation: null,
      opportunityPosture: null,
    });

    expect(values).toHaveBeenCalledOnce();
    expect(values.mock.calls[0]?.[0]).not.toHaveProperty('orgRole');
    expect(values.mock.calls[0]?.[0]).not.toHaveProperty('entitlement');
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalledOnce();
  });

  it('provides no employer read path for another member opportunity posture', async () => {
    await expect((caller(userB).get as unknown as (input: unknown) => Promise<unknown>)({
      userId: userA.userId,
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it('loads an existing completed record with every new career field null', async () => {
    const existing = {
      userId: userA.userId,
      intentions: ['develop'],
      primaryIntention: 'develop',
      completedAt: new Date('2026-08-01T10:00:00Z'),
      careerFamilyId: null,
      careerRoleId: null,
      selfDescribedTitle: null,
      targetRoleId: null,
      seniority: null,
      industryId: null,
      workMode: null,
    };
    mocks.select.mockReturnValueOnce(selectResult([existing]));

    await expect(caller().get()).resolves.toEqual(existing);
  });

  it('persists an own-title draft byte-identically without making it authoritative', async () => {
    const ownTitle = '  Umphathi Wezimali  ';
    mocks.select.mockReturnValueOnce(selectResult([{ id: crypto.randomUUID() }]));
    const set = vi.fn((_input: Record<string, unknown>) => ({
      where: () => ({ returning: vi.fn().mockResolvedValue([{ userId: userA.userId }]) }),
    }));
    mocks.update.mockReturnValueOnce({ set });

    await caller().saveCareerDraft({ selfDescribedTitle: ownTitle });

    expect(set).toHaveBeenCalledWith(expect.objectContaining({
      careerDraft: expect.objectContaining({ selfDescribedTitle: ownTitle }),
      currentStep: 'career',
    }));
    expect(set.mock.calls[0]?.[0]).not.toHaveProperty('selfDescribedTitle');
  });

  it('rejects a role that belongs to another family', async () => {
    const roleId = crypto.randomUUID();
    const submittedFamily = crypto.randomUUID();
    const tx = {
      select: vi.fn().mockReturnValueOnce(selectResult([{
        id: roleId,
        familyId: crypto.randomUUID(),
        version: 1,
        active: true,
      }])),
    };
    mocks.transaction.mockImplementationOnce(async (operation) => operation(tx));

    await expect(caller().confirmCareer({ familyId: submittedFamily, roleId }))
      .rejects.toMatchObject({ code: 'BAD_REQUEST', message: 'Role does not belong to family' });
  });

  it('rejects an inactive taxonomy role', async () => {
    const tx = { select: vi.fn().mockReturnValueOnce(selectResult([])) };
    mocks.transaction.mockImplementationOnce(async (operation) => operation(tx));

    await expect(caller().confirmCareer({
      familyId: crypto.randomUUID(),
      roleId: crypto.randomUUID(),
    })).rejects.toMatchObject({ code: 'BAD_REQUEST', message: 'Inactive career role' });
  });

  it('confirms an unmatched local title unchanged and never accepts another user id', async () => {
    const ownTitle = '  Umphathi Wezimali  ';
    const set = vi.fn((_input: Record<string, unknown>) => ({
      where: () => ({ returning: vi.fn().mockResolvedValue([{ userId: userA.userId }]) }),
    }));
    const tx = {
      select: vi.fn().mockReturnValueOnce(selectResult([{ id: crypto.randomUUID() }])),
      update: vi.fn(() => ({ set })),
    };
    mocks.transaction.mockImplementationOnce(async (operation) => operation(tx));

    await caller().confirmCareer({ selfDescribedTitle: ownTitle });
    expect(set).toHaveBeenCalledWith(expect.objectContaining({
      selfDescribedTitle: ownTitle,
      taxonomyVersion: null,
      careerConfirmedAt: expect.any(Date),
    }));

    await expect((caller().confirmCareer as unknown as (input: unknown) => Promise<unknown>)({
      selfDescribedTitle: ownTitle,
      userId: userB.userId,
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  // D-0102-1. A member whose situation was remapped by migration 0007 must be
  // asked before Levav treats the remap as their answer (ONB-001).
  it('clears the inferred flag when a migrated member confirms the remapped situation', async () => {
    mocks.select.mockReturnValueOnce(selectResult([{
      userId: userA.userId, employmentSituation: 'not_working', situationInferred: true,
    }]));
    const set = vi.fn((_input: Record<string, unknown>) => ({
      where: () => ({ returning: vi.fn().mockResolvedValue([{ userId: userA.userId }]) }),
    }));
    mocks.update.mockReturnValueOnce({ set });

    await caller().confirmSituation({});

    const written = set.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(written.situationInferred).toBe(false);
    expect(written.situationConfirmedAt).toBeInstanceOf(Date);
    // Confirming keeps the remapped value — it does not silently rewrite it again.
    expect(written).not.toHaveProperty('employmentSituation');
  });

  it('replaces the situation when the migrated member chooses a different one', async () => {
    mocks.select.mockReturnValueOnce(selectResult([{
      userId: userA.userId, employmentSituation: 'not_working', situationInferred: true,
    }]));
    const set = vi.fn((_input: Record<string, unknown>) => ({
      where: () => ({ returning: vi.fn().mockResolvedValue([{ userId: userA.userId }]) }),
    }));
    mocks.update.mockReturnValueOnce({ set });

    await caller().confirmSituation({ employmentSituation: 'career_break' });

    const written = set.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(written.employmentSituation).toBe('career_break');
    expect(written.situationInferred).toBe(false);
  });

  it('rejects confirmation when the member has no onboarding record', async () => {
    mocks.select.mockReturnValueOnce(selectResult([]));
    await expect(caller().confirmSituation({})).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('emits the situation and posture category so the events are answerable', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    mocks.select.mockReturnValueOnce(selectResult([]));
    mockInsert({ userId: userA.userId });

    await caller().complete({
      intentions: ['develop'], employmentSituation: 'employed', opportunityPosture: 'not_seeking',
    });

    const emitted = info.mock.calls.map((call) => String(call[0]));
    expect(emitted.some((line) => line.includes('onboarding.situation.set') && line.includes('employed'))).toBe(true);
    expect(emitted.some((line) => line.includes('onboarding.posture.set') && line.includes('not_seeking'))).toBe(true);
    // Categories only — never a free-text value or an identifier.
    expect(emitted.every((line) => !line.includes(userA.userId))).toBe(true);
  });
});
