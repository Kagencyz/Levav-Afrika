CREATE TYPE "public"."personal_status" AS ENUM('employed', 'unemployed', 'self_employed', 'freelancing', 'studying', 'volunteering', 'changing_careers', 'returning_to_work', 'running_organization');--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"primary_goal" varchar(40) NOT NULL,
	"personal_status" "personal_status" NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_onboarding_user_id_unique" ON "user_onboarding" USING btree ("user_id");