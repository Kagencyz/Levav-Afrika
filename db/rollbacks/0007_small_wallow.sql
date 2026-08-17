CREATE TYPE "public"."personal_status" AS ENUM(
  'employed', 'unemployed', 'self_employed', 'freelancing', 'studying',
  'volunteering', 'changing_careers', 'returning_to_work', 'running_organization'
);

ALTER TABLE "user_onboarding" ADD COLUMN "personal_status" "personal_status";
UPDATE "user_onboarding"
SET "personal_status" = CASE "employment_situation"::text
  WHEN 'not_working' THEN 'unemployed'::personal_status
  WHEN 'career_break' THEN 'returning_to_work'::personal_status
  WHEN 'running_organisation' THEN 'running_organization'::personal_status
  ELSE "employment_situation"::text::personal_status
END;
ALTER TABLE "user_onboarding" ALTER COLUMN "personal_status" SET NOT NULL;

ALTER TABLE "user_onboarding" RENAME COLUMN "intentions" TO "goals";
ALTER TABLE "user_onboarding" RENAME COLUMN "primary_intention" TO "primary_goal";
UPDATE "user_onboarding"
SET
  "goals" = (
    SELECT COALESCE(jsonb_agg(mapped.value ORDER BY item.ordinality), '[]'::jsonb)
    FROM jsonb_array_elements_text("goals") WITH ORDINALITY AS item(value, ordinality)
    CROSS JOIN LATERAL (
      VALUES (CASE item.value
        WHEN 'find_work' THEN 'find-job'
        WHEN 'find_quickwork' THEN 'find-quickwork'
        WHEN 'post_quickwork' THEN 'post-quickwork'
        WHEN 'contribute' THEN 'find-volunteer'
        WHEN 'network' THEN 'community'
        WHEN 'represent_organisation' THEN 'hire'
        ELSE item.value
      END)
    ) AS mapped(value)
  ),
  "primary_goal" = CASE "primary_goal"
    WHEN 'find_work' THEN 'find-job'
    WHEN 'find_quickwork' THEN 'find-quickwork'
    WHEN 'post_quickwork' THEN 'post-quickwork'
    WHEN 'contribute' THEN 'find-volunteer'
    WHEN 'network' THEN 'community'
    WHEN 'represent_organisation' THEN 'hire'
    ELSE "primary_goal"
  END;

ALTER TABLE "user_onboarding" DROP CONSTRAINT "user_onboarding_career_family_id_career_families_id_fk";
ALTER TABLE "user_onboarding" DROP CONSTRAINT "user_onboarding_career_role_id_career_roles_id_fk";
ALTER TABLE "user_onboarding" DROP CONSTRAINT "user_onboarding_target_role_id_career_roles_id_fk";
ALTER TABLE "user_onboarding" DROP CONSTRAINT "user_onboarding_industry_id_industries_id_fk";
ALTER TABLE "user_onboarding"
  DROP COLUMN "employment_situation",
  DROP COLUMN "situation_inferred",
  DROP COLUMN "situation_confirmed_at",
  DROP COLUMN "opportunity_posture",
  DROP COLUMN "career_draft",
  DROP COLUMN "career_family_id",
  DROP COLUMN "career_role_id",
  DROP COLUMN "self_described_title",
  DROP COLUMN "target_role_id",
  DROP COLUMN "seniority",
  DROP COLUMN "industry_id",
  DROP COLUMN "work_mode",
  DROP COLUMN "taxonomy_version",
  DROP COLUMN "career_confirmed_at",
  DROP COLUMN "current_step";
ALTER TABLE "user_onboarding" ALTER COLUMN "completed_at" SET DEFAULT now();
ALTER TABLE "user_onboarding" ALTER COLUMN "completed_at" SET NOT NULL;
DROP TYPE "public"."work_mode";
DROP TYPE "public"."opportunity_posture";
DROP TYPE "public"."employment_situation";
