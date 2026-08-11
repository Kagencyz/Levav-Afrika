ALTER TABLE "user_onboarding" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "user_onboarding_select_own" ON "user_onboarding" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_onboarding"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_onboarding_insert_own" ON "user_onboarding" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_onboarding"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_onboarding_update_own" ON "user_onboarding" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("user_onboarding"."user_id" = (select auth.uid())) WITH CHECK ("user_onboarding"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_onboarding_service_select" ON "user_onboarding" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "user_onboarding_service_insert" ON "user_onboarding" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "user_onboarding_service_update" ON "user_onboarding" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);