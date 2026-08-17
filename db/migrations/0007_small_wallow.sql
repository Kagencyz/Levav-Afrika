CREATE TYPE "public"."employment_situation" AS ENUM('employed', 'self_employed', 'running_organisation', 'freelancing', 'studying', 'not_working', 'career_break');--> statement-breakpoint
CREATE TYPE "public"."opportunity_posture" AS ENUM('actively_seeking', 'open_to_opportunities', 'not_seeking');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('remote', 'hybrid', 'on_site');--> statement-breakpoint
ALTER TABLE "user_onboarding" RENAME COLUMN "goals" TO "intentions";--> statement-breakpoint
ALTER TABLE "user_onboarding" RENAME COLUMN "primary_goal" TO "primary_intention";--> statement-breakpoint
ALTER TABLE "user_onboarding" ALTER COLUMN "completed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_onboarding" ALTER COLUMN "completed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "employment_situation" "employment_situation";--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "situation_inferred" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "situation_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "opportunity_posture" "opportunity_posture";--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "career_draft" jsonb;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "career_family_id" uuid;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "career_role_id" uuid;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "self_described_title" varchar(180);--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "target_role_id" uuid;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "seniority" "career_seniority";--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "industry_id" uuid;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "work_mode" "work_mode";--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "taxonomy_version" integer;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "career_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD COLUMN "current_step" varchar(40) DEFAULT 'intentions' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_career_family_id_career_families_id_fk" FOREIGN KEY ("career_family_id") REFERENCES "public"."career_families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_career_role_id_career_roles_id_fk" FOREIGN KEY ("career_role_id") REFERENCES "public"."career_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_target_role_id_career_roles_id_fk" FOREIGN KEY ("target_role_id") REFERENCES "public"."career_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
UPDATE "user_onboarding"
SET
  "intentions" = (
    SELECT COALESCE(jsonb_agg(mapped.value ORDER BY item.ordinality), '[]'::jsonb)
    FROM jsonb_array_elements_text("intentions") WITH ORDINALITY AS item(value, ordinality)
    CROSS JOIN LATERAL (
      VALUES (CASE item.value
        WHEN 'find-job' THEN 'find_work'
        WHEN 'find-quickwork' THEN 'find_quickwork'
        WHEN 'post-quickwork' THEN 'post_quickwork'
        WHEN 'find-volunteer' THEN 'contribute'
        WHEN 'post-volunteer' THEN 'contribute'
        WHEN 'community' THEN 'network'
        ELSE item.value
      END)
    ) AS mapped(value)
  ),
  "primary_intention" = CASE "primary_intention"
    WHEN 'find-job' THEN 'find_work'
    WHEN 'find-quickwork' THEN 'find_quickwork'
    WHEN 'post-quickwork' THEN 'post_quickwork'
    WHEN 'find-volunteer' THEN 'contribute'
    WHEN 'post-volunteer' THEN 'contribute'
    WHEN 'community' THEN 'network'
    ELSE "primary_intention"
  END,
  "employment_situation" = CASE "personal_status"::text
    WHEN 'unemployed' THEN 'not_working'::employment_situation
    WHEN 'volunteering' THEN 'not_working'::employment_situation
    WHEN 'changing_careers' THEN 'employed'::employment_situation
    WHEN 'returning_to_work' THEN 'career_break'::employment_situation
    WHEN 'running_organization' THEN 'running_organisation'::employment_situation
    ELSE "personal_status"::text::employment_situation
  END,
  "situation_inferred" = true,
  "current_step" = 'complete';--> statement-breakpoint
ALTER TABLE "user_onboarding" DROP COLUMN "personal_status";--> statement-breakpoint
DROP TYPE "public"."personal_status";
