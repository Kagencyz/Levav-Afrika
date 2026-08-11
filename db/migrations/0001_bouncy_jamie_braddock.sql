CREATE TYPE "public"."org_member_status" AS ENUM('invited', 'active', 'removed');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('owner', 'admin', 'recruiter', 'member');--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('company', 'church', 'non_profit', 'government', 'school', 'university', 'agency', 'startup', 'other');--> statement-breakpoint
CREATE TYPE "public"."org_verification_status" AS ENUM('pending', 'in_review', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_access_level" AS ENUM('standard', 'admin');--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"org_role" "org_role" DEFAULT 'member' NOT NULL,
	"status" "org_member_status" DEFAULT 'invited' NOT NULL,
	"invited_by_user_id" uuid,
	"invited_at" timestamp with time zone,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization_type" "org_type" NOT NULL,
	"industry" varchar(120),
	"size" varchar(60),
	"verification_status" "org_verification_status" DEFAULT 'pending' NOT NULL,
	"business_documents" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "talents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"bio" text,
	"category" varchar(120),
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"location" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "talents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"access_level" "user_access_level" DEFAULT 'standard' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_normalized" CHECK ("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talents" ADD CONSTRAINT "talents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_member_unique" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "talents_user_id_unique" ON "talents" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE POLICY "org_members_service_select" ON "organization_members" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "org_members_service_insert" ON "organization_members" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "org_members_service_update" ON "organization_members" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "organizations_service_select" ON "organizations" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "organizations_service_insert" ON "organizations" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "organizations_service_update" ON "organizations" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "talents_select_own" ON "talents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("talents"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "talents_insert_own" ON "talents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("talents"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "talents_update_own" ON "talents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("talents"."user_id" = (select auth.uid())) WITH CHECK ("talents"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "talents_service_select" ON "talents" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "talents_service_insert" ON "talents" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "talents_service_update" ON "talents" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("users"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_service_select" ON "users" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);