import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  varchar,
  jsonb,
  timestamp,
  pgEnum,
  uniqueIndex,
  check,
  pgPolicy,
  pgRole,
} from 'drizzle-orm/pg-core';
import { authUid, authUsers, authenticatedRole } from 'drizzle-orm/supabase';

// Stage B: only the four approved foundational entities are modeled here.
// Levav 28, Learn, QuickWork, SkillSpace, Impact, Champions, subscriptions,
// payments, jobs, applications, messaging, reviews, and WRI are intentionally
// NOT part of this schema — see docs/DOMAIN_MODEL.md and docs/NEXT_MILESTONE.md.

// Restricted runtime role used by the Hono/tRPC server (Slice 1 auth
// architecture — see docs/full-stack/*.md). NOT service_role, NOT postgres.
// `.existing()`: this is a typed REFERENCE for policy `to:` clauses only —
// Drizzle's PgRoleConfig has no `login`/password concept, so letting
// drizzle-kit generate `CREATE ROLE` from this declaration would produce a
// role that can't authenticate. The real `CREATE ROLE levav_app LOGIN` (no
// password — set out-of-band per environment, never committed) is
// hand-written in the custom grants migration instead.
//
// Grants + the policies below define exactly what this role may touch.
// Application-level ownership/membership checks in tRPC remain the load-
// bearing authorization boundary for everything this role does — policies
// granted `TO levavAppRole` are a reviewable formality (Postgres denies by
// default once RLS is enabled with no matching policy), not row-level
// tenancy enforcement. Real per-row `auth.uid()` enforcement is what the
// `authenticatedRole` policies below provide, for the Storage/gateway path.
export const levavAppRole = pgRole('levav_app').existing();

// Platform-level access only — NOT a business identity. Whether a user "is a
// talent" is derived from the existence of a row in `talents` (userId FK);
// whether a user "is on an organization's team", and in what capacity, is
// derived from `organizationMembers` (userId FK + orgRole). Neither is stored
// here, so a person can hold both without an artificial single-role choice,
// and there is no redundant flag that could drift out of sync with those
// tables. `accessLevel` only answers "how much platform-wide access does this
// account have" — everything else is a join, not a column.
export const userAccessLevelEnum = pgEnum('user_access_level', ['standard', 'admin']);

export const orgTypeEnum = pgEnum('org_type', [
  'company',
  'church',
  'non_profit',
  'government',
  'school',
  'university',
  'agency',
  'startup',
  'other',
]);
export const orgVerificationEnum = pgEnum('org_verification_status', [
  'pending',
  'in_review',
  'verified',
  'rejected',
]);
export const orgRoleEnum = pgEnum('org_role', ['owner', 'admin', 'recruiter', 'member']);
export const orgMemberStatusEnum = pgEnum('org_member_status', ['invited', 'active', 'removed']);

// Onboarding preference capture (upgrade brief §3): what the user wants to
// do (goals, multi-select) and their personal status. This is preference
// data, NOT identity — business capabilities remain derived from `talents` /
// `organizationMembers` rows per the domain model.
export const personalStatusEnum = pgEnum('personal_status', [
  'employed',
  'unemployed',
  'self_employed',
  'freelancing',
  'studying',
  'volunteering',
  'changing_careers',
  'returning_to_work',
  'running_organization',
]);

export const users = pgTable(
  'users',
  {
    // Equals auth.users.id — set only by the handle_new_user() trigger on
    // signup (custom grants migration), never generated here and never
    // written by the app directly.
    id: uuid('id')
      .primaryKey()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    // password_hash removed: Supabase Auth (auth.users) owns password
    // storage/hashing entirely as of the Slice 1 auth architecture — see
    // docs/full-stack/*.md.
    name: varchar('name', { length: 255 }).notNull(),
    // Platform-level access tier only. See the comment on userAccessLevelEnum
    // above — business identity (talent / employer team member) is derived
    // from related tables, never stored here.
    accessLevel: userAccessLevelEnum('access_level').notNull().default('standard'),
    // Soft-delete: identity records are never hard-deleted by normal product
    // flows. A hard DELETE remains possible (e.g. legal erasure requests) —
    // see the FK cascade behavior below — but is not the expected path.
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    check('users_email_normalized', sql`${table.email} = lower(${table.email})`),
    // Real, auth.uid()-scoped policy — protects the Storage/gateway path.
    pgPolicy('users_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    // Formality only, not tenancy enforcement — see the levavAppRole comment
    // above. SELECT-only: no insert/update/delete policy exists here because
    // none is granted either; the signup/email-sync triggers (security
    // definer) are the only writers to this table.
    pgPolicy('users_service_select', {
      for: 'select',
      to: levavAppRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const talents = pgTable(
  'talents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    bio: text('bio'),
    category: varchar('category', { length: 120 }),
    skills: jsonb('skills').$type<string[]>().notNull().default([]),
    location: varchar('location', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Enforces the 1:1 User<->Talent invariant from docs/DOMAIN_MODEL.md.
    // The existence of this row IS the "talent" business capability — see
    // the comment on userAccessLevelEnum above.
    uniqueIndex('talents_user_id_unique').on(table.userId),
    pgPolicy('talents_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
    }),
    pgPolicy('talents_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.userId} = ${authUid}`,
    }),
    pgPolicy('talents_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
      withCheck: sql`${table.userId} = ${authUid}`,
    }),
    // Separately named, deliberately permissive service-path policies for
    // the direct tRPC connection (levav_app) — split by operation (rather
    // than one `for: 'all'` policy) so DELETE is denied independently at
    // both the RLS layer and the grant layer, not dependent on the grant
    // alone. NOT tenant-isolation controls — see the levavAppRole comment
    // on `users` above. Real ownership enforcement for this path is tRPC's
    // authedProcedure checks; these policies only exist because Postgres
    // denies-by-default once RLS is enabled with no matching policy for a
    // role. No `talents_service_delete` policy exists, deliberately — see
    // the matching grant, which also never includes DELETE.
    pgPolicy('talents_service_select', {
      for: 'select',
      to: levavAppRole,
      using: sql`true`,
    }),
    pgPolicy('talents_service_insert', {
      for: 'insert',
      to: levavAppRole,
      withCheck: sql`true`,
    }),
    pgPolicy('talents_service_update', {
      for: 'update',
      to: levavAppRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const userOnboarding = pgTable(
  'user_onboarding',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Multi-select signup goals (slugs, e.g. 'find-job', 'develop').
    // Validated against the canonical list in server/routes/onboarding.ts.
    goals: jsonb('goals').$type<string[]>().notNull().default([]),
    // First selected goal — drives the user's first-run routing.
    primaryGoal: varchar('primary_goal', { length: 40 }).notNull(),
    personalStatus: personalStatusEnum('personal_status').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One onboarding record per user; re-running onboarding updates it.
    uniqueIndex('user_onboarding_user_id_unique').on(table.userId),
  ]
);

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    organizationType: orgTypeEnum('organization_type').notNull(),
    industry: varchar('industry', { length: 120 }),
    size: varchar('size', { length: 60 }),
    verificationStatus: orgVerificationEnum('verification_status').notNull().default('pending'),
    businessDocuments: jsonb('business_documents').$type<string[]>().notNull().default([]),
    // Archival instead of hard delete — an organization going through dispute
    // or offboarding shouldn't disappear outright.
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  () => [
    // Slice 1 conservative model — service-path only, per
    // docs/full-stack/ORGANIZATION_DOMAIN_MODEL.md §1: these policies grant
    // levav_app no row-level discrimination and are not an authorization
    // mechanism. Real authorization (organization creation, updates,
    // membership, ownership transfer) is entirely Hono/tRPC's
    // responsibility — see that document's Organization domain API. No
    // authenticated-role policy exists yet (the Data API is disabled, so
    // one would currently be evaluated by nothing) and no delete policy
    // exists at all, matching the grant, which never includes DELETE.
    pgPolicy('organizations_service_select', {
      for: 'select',
      to: levavAppRole,
      using: sql`true`,
    }),
    pgPolicy('organizations_service_insert', {
      for: 'insert',
      to: levavAppRole,
      withCheck: sql`true`,
    }),
    pgPolicy('organizations_service_update', {
      for: 'update',
      to: levavAppRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Org-scoped role — distinct from users.accessLevel (platform-level).
    // The existence of a row here IS the "employer team member" business
    // capability — see the comment on userAccessLevelEnum above.
    orgRole: orgRoleEnum('org_role').notNull().default('member'),
    // Membership lifecycle uses status, not deletion — removing a member
    // sets status: 'removed' rather than deleting the row, preserving
    // historical membership records.
    status: orgMemberStatusEnum('status').notNull().default('invited'),
    // Provenance: who invited this member. Nullable — null means a founding
    // member (self-created when the organization was registered, not invited
    // by anyone). SET NULL on delete, not CASCADE: deleting the *inviter's*
    // account must never delete the *invitee's* membership — those are
    // independent facts, and this FK references a different user than the
    // row's own subject (table.userId).
    invitedByUserId: uuid('invited_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Enforces "one membership per user per organization" from docs/DOMAIN_MODEL.md.
    // Also serves organizationId-first lookups — no separate index is added
    // for userId-alone lookups since no access path in this milestone needs it.
    uniqueIndex('org_member_unique').on(table.organizationId, table.userId),
    // Slice 1 conservative model — service-path only, per
    // docs/full-stack/ORGANIZATION_DOMAIN_MODEL.md. Deliberately NOT the
    // authenticated-role policies proposed and rejected earlier in this
    // design process (founding-owner insert, invitation-provenance insert,
    // role-transition update) — those encode real, still-partially-open
    // business rules (§4-§7 of that document) and are implemented only in
    // Hono/tRPC, not here, while the Data API stays disabled. No
    // org_members_select_own policy either — deferred per that document's
    // §3 (correct-but-inert while nothing evaluates it). No delete policy,
    // matching the grant, which never includes DELETE.
    pgPolicy('org_members_service_select', {
      for: 'select',
      to: levavAppRole,
      using: sql`true`,
    }),
    pgPolicy('org_members_service_insert', {
      for: 'insert',
      to: levavAppRole,
      withCheck: sql`true`,
    }),
    pgPolicy('org_members_service_update', {
      for: 'update',
      to: levavAppRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();
