import {
  mysqlTable,
  serial,
  varchar,
  text,
  json,
  boolean,
  timestamp,
  mysqlEnum,
  bigint,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['talent', 'client', 'admin']).notNull().default('client'),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const talents = mysqlTable('talents', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  skills: json('skills').$type<string[]>().notNull().default([]),
  portfolio: json('portfolio').$type<string[]>().notNull().default([]),
  avatar: varchar('avatar', { length: 500 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  rate: varchar('rate', { length: 100 }).notNull(),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
});

export const employers = mysqlTable('employers', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id).notNull(),
  // Business Information
  companyName: varchar('company_name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 255 }),
  industry: varchar('industry', { length: 100 }).notNull(),
  companySize: varchar('company_size', { length: 50 }).notNull(),
  website: varchar('website', { length: 255 }),
  description: text('description'),
  logo: varchar('logo', { length: 500 }),
  // Business Address
  businessAddress: text('business_address'),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 100 }),
  // Contact Person
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  contactTitle: varchar('contact_title', { length: 100 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }),
  // Verification
  verificationStatus: mysqlEnum('verification_status', ['pending', 'in_review', 'verified', 'rejected']).notNull().default('pending'),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: bigint('verified_by', { mode: 'number', unsigned: true }).references(() => users.id),
  rejectionReason: text('rejection_reason'),
  businessDocuments: json('business_documents').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const jobs = mysqlTable('jobs', {
  id: serial('id').primaryKey(),
  employerId: bigint('employer_id', { mode: 'number', unsigned: true }).references(() => employers.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(),
  skills: json('skills').$type<string[]>().notNull().default([]),
  type: mysqlEnum('type', ['full-time', 'part-time', 'contract', 'internship', 'remote']).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  salary: varchar('salary', { length: 255 }),
  status: mysqlEnum('status', ['active', 'paused', 'closed']).notNull().default('active'),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookings = mysqlTable('bookings', {
  id: serial('id').primaryKey(),
  clientId: bigint('client_id', { mode: 'number', unsigned: true }).references(() => users.id),
  talentId: bigint('talent_id', { mode: 'number', unsigned: true }).references(() => talents.id),
  status: mysqlEnum('status', ['pending', 'confirmed', 'completed', 'cancelled']).notNull().default('pending'),
  eventDate: timestamp('event_date'),
  notes: text('notes').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const applications = mysqlTable('applications', {
  id: serial('id').primaryKey(),
  jobId: bigint('job_id', { mode: 'number', unsigned: true }).references(() => jobs.id),
  talentId: bigint('talent_id', { mode: 'number', unsigned: true }).references(() => talents.id),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id),
  status: mysqlEnum('status', ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).notNull().default('pending'),
  coverLetter: text('cover_letter'),
  resumeUrl: varchar('resume_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = mysqlTable('messages', {
  id: serial('id').primaryKey(),
  senderId: bigint('sender_id', { mode: 'number', unsigned: true }).references(() => users.id),
  receiverId: bigint('receiver_id', { mode: 'number', unsigned: true }).references(() => users.id),
  content: text('content').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = mysqlTable('notifications', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  link: varchar('link', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = mysqlTable('reviews', {
  id: serial('id').primaryKey(),
  bookingId: bigint('booking_id', { mode: 'number', unsigned: true }).references(() => bookings.id),
  reviewerId: bigint('reviewer_id', { mode: 'number', unsigned: true }).references(() => users.id),
  revieweeId: bigint('reviewee_id', { mode: 'number', unsigned: true }).references(() => users.id),
  rating: bigint('rating', { mode: 'number' }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wriScores = mysqlTable('wri_scores', {
  id: serial('id').primaryKey(),
  talentId: bigint('talent_id', { mode: 'number', unsigned: true }).references(() => talents.id),
  overall: bigint('overall', { mode: 'number' }).notNull(),
  technical: bigint('technical', { mode: 'number' }).notNull(),
  communication: bigint('communication', { mode: 'number' }).notNull(),
  reliability: bigint('reliability', { mode: 'number' }).notNull(),
  leadership: bigint('leadership', { mode: 'number' }).notNull(),
  creativity: bigint('creativity', { mode: 'number' }).notNull(),
  growth: bigint('growth', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
