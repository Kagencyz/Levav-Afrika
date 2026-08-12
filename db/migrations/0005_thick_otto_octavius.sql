ALTER TABLE "organizations" ADD COLUMN "registration_number" varchar(120);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "website" varchar(500);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "business_address" varchar(500);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "city" varchar(120);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "country" varchar(120);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_title" varchar(120);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_email" varchar(320);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_phone" varchar(40);--> statement-breakpoint
CREATE INDEX "org_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_members_invited_by_user_id_idx" ON "organization_members" USING btree ("invited_by_user_id");