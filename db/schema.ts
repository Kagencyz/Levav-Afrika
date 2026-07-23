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
} from 'drizzle-orm/pg-core';

// Stage B: only the four approved foundational entities are modeled here.
// Levav 28, Learn, QuickWork, SkillSpace, Impact, Champions, subscriptions,
// payments, jobs, applications, messaging, reviews, and WRI are intentionally
// NOT part of this schema — see docs/DOMAIN_MODEL.md and docs/NEXT_MILESTONE.md.

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

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
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
  (table) => ({
    emailUnique: uniqueIndex('users_email_unique').on(table.email),
    emailNormalized: check('users_email_normalized', sql`${table.email} = lower(${table.email})`),
  })
);

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
  (table) => ({
    // Enforces the 1:1 User<->Talent invariant from docs/DOMAIN_MODEL.md.
    // The existence of this row IS the "talent" business capability — see
    // the comment on userAccessLevelEnum above.
    userIdUnique: uniqueIndex('talents_user_id_unique').on(table.userId),
  })
);

export const organizations = pgTable('organizations', {
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
});

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
  (table) => ({
    // Enforces "one membership per user per organization" from docs/DOMAIN_MODEL.md.
    // Also serves organizationId-first lookups — no separate index is added
    // for userId-alone lookups since no access path in this milestone needs it.
    uniqueMembership: uniqueIndex('org_member_unique').on(table.organizationId, table.userId),
  })
);
