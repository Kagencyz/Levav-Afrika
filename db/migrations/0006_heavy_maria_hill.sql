CREATE TYPE "public"."career_seniority" AS ENUM('entry', 'mid', 'senior', 'lead', 'executive');--> statement-breakpoint
CREATE TABLE "career_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(160) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"supersedes_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "career_families" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "career_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(180) NOT NULL,
	"seniority" "career_seniority" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"supersedes_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "career_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(180) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"supersedes_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "industries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "role_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"alias" varchar(180) NOT NULL,
	"normalized_alias" varchar(180) NOT NULL,
	"language" varchar(20) DEFAULT 'en' NOT NULL,
	"region" varchar(80),
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"supersedes_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_aliases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "taxonomy_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "taxonomy_audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "career_roles" ADD CONSTRAINT "career_roles_family_id_career_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."career_families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_aliases" ADD CONSTRAINT "role_aliases_role_id_career_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."career_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_audit_log" ADD CONSTRAINT "taxonomy_audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "career_families_slug_version_unique" ON "career_families" USING btree ("slug","version");--> statement-breakpoint
CREATE INDEX "career_families_active_idx" ON "career_families" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "career_roles_slug_version_unique" ON "career_roles" USING btree ("slug","version");--> statement-breakpoint
CREATE INDEX "career_roles_family_active_idx" ON "career_roles" USING btree ("family_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "industries_slug_version_unique" ON "industries" USING btree ("slug","version");--> statement-breakpoint
CREATE INDEX "industries_active_idx" ON "industries" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "role_aliases_value_region_version_unique" ON "role_aliases" USING btree ("normalized_alias","region","version");--> statement-breakpoint
CREATE INDEX "role_aliases_role_active_idx" ON "role_aliases" USING btree ("role_id","active");--> statement-breakpoint
CREATE INDEX "role_aliases_normalized_idx" ON "role_aliases" USING btree ("normalized_alias");--> statement-breakpoint
CREATE INDEX "taxonomy_audit_actor_idx" ON "taxonomy_audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "taxonomy_audit_entity_idx" ON "taxonomy_audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE POLICY "career_families_public_select" ON "career_families" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "career_families_service_select" ON "career_families" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "career_families_service_insert" ON "career_families" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "career_families_service_update" ON "career_families" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "career_roles_public_select" ON "career_roles" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "career_roles_service_select" ON "career_roles" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "career_roles_service_insert" ON "career_roles" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "career_roles_service_update" ON "career_roles" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "industries_public_select" ON "industries" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "industries_service_select" ON "industries" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "industries_service_insert" ON "industries" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "industries_service_update" ON "industries" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "role_aliases_public_select" ON "role_aliases" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "role_aliases_service_select" ON "role_aliases" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "role_aliases_service_insert" ON "role_aliases" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "role_aliases_service_update" ON "role_aliases" AS PERMISSIVE FOR UPDATE TO "levav_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "taxonomy_audit_service_select" ON "taxonomy_audit_log" AS PERMISSIVE FOR SELECT TO "levav_app" USING (true);--> statement-breakpoint
CREATE POLICY "taxonomy_audit_service_insert" ON "taxonomy_audit_log" AS PERMISSIVE FOR INSERT TO "levav_app" WITH CHECK (true);

--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;

--> statement-breakpoint
GRANT SELECT ON public.career_families, public.career_roles, public.industries, public.role_aliases TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.career_families, public.career_roles, public.industries, public.role_aliases TO levav_app;
GRANT SELECT, INSERT ON public.taxonomy_audit_log TO levav_app;
REVOKE DELETE ON public.career_families, public.career_roles, public.industries, public.role_aliases, public.taxonomy_audit_log FROM anon, authenticated, levav_app;

--> statement-breakpoint
INSERT INTO career_families (slug, name) VALUES
  ('finance-accounting', 'Finance and Accounting'),
  ('agriculture', 'Agriculture'),
  ('mining-extractives', 'Mining and Extractives'),
  ('construction-built-environment', 'Construction and Built Environment'),
  ('health', 'Health'),
  ('education', 'Education'),
  ('public-administration', 'Public Administration'),
  ('technology', 'Technology'),
  ('logistics-supply-chain', 'Logistics and Supply Chain'),
  ('trade-retail', 'Trade and Retail'),
  ('hospitality-tourism', 'Hospitality and Tourism'),
  ('creative-media', 'Creative and Media'),
  ('professional-services', 'Professional Services'),
  ('manufacturing', 'Manufacturing'),
  ('energy-utilities', 'Energy and Utilities'),
  ('social-community', 'Social and Community');

--> statement-breakpoint
INSERT INTO industries (slug, name) VALUES
  ('agriculture-forestry-fishing', 'Agriculture, Forestry and Fishing'),
  ('mining-quarrying', 'Mining and Quarrying'),
  ('manufacturing', 'Manufacturing'),
  ('construction', 'Construction'),
  ('wholesale-retail', 'Wholesale and Retail Trade'),
  ('transport-storage', 'Transport and Storage'),
  ('accommodation-food', 'Accommodation and Food Services'),
  ('information-communication', 'Information and Communication'),
  ('financial-insurance', 'Financial and Insurance Services'),
  ('public-administration', 'Public Administration'),
  ('education', 'Education'),
  ('health-social-work', 'Health and Social Work'),
  ('energy-utilities', 'Energy and Utilities');

--> statement-breakpoint
INSERT INTO career_roles (family_id, slug, name, seniority)
SELECT family.id, seeded.slug, seeded.name, seeded.seniority::career_seniority
FROM (VALUES
  ('finance-accounting', 'accounts-assistant', 'Accounts Assistant', 'entry'),
  ('finance-accounting', 'accountant', 'Accountant', 'mid'),
  ('finance-accounting', 'finance-manager', 'Finance Manager', 'senior'),
  ('finance-accounting', 'head-of-finance', 'Head of Finance', 'lead'),
  ('finance-accounting', 'chief-financial-officer', 'Chief Financial Officer', 'executive'),
  ('agriculture', 'farm-assistant', 'Farm Assistant', 'entry'),
  ('agriculture', 'agronomist', 'Agronomist', 'mid'),
  ('agriculture', 'farm-manager', 'Farm Manager', 'senior'),
  ('agriculture', 'agricultural-operations-lead', 'Agricultural Operations Lead', 'lead'),
  ('agriculture', 'agriculture-director', 'Agriculture Director', 'executive'),
  ('mining-extractives', 'mine-technician', 'Mine Technician', 'entry'),
  ('mining-extractives', 'mining-engineer', 'Mining Engineer', 'mid'),
  ('mining-extractives', 'mine-superintendent', 'Mine Superintendent', 'senior'),
  ('mining-extractives', 'mine-manager', 'Mine Manager', 'lead'),
  ('mining-extractives', 'mining-director', 'Mining Director', 'executive'),
  ('construction-built-environment', 'site-assistant', 'Site Assistant', 'entry'),
  ('construction-built-environment', 'quantity-surveyor', 'Quantity Surveyor', 'mid'),
  ('construction-built-environment', 'construction-manager', 'Construction Manager', 'senior'),
  ('construction-built-environment', 'project-director', 'Project Director', 'lead'),
  ('construction-built-environment', 'built-environment-executive', 'Built Environment Executive', 'executive'),
  ('health', 'health-assistant', 'Health Assistant', 'entry'),
  ('health', 'nurse', 'Nurse', 'mid'),
  ('health', 'medical-officer', 'Medical Officer', 'senior'),
  ('health', 'clinical-director', 'Clinical Director', 'lead'),
  ('health', 'health-executive', 'Health Executive', 'executive'),
  ('education', 'teaching-assistant', 'Teaching Assistant', 'entry'),
  ('education', 'teacher', 'Teacher', 'mid'),
  ('education', 'head-teacher', 'Head Teacher', 'senior'),
  ('education', 'education-director', 'Education Director', 'lead'),
  ('education', 'education-executive', 'Education Executive', 'executive'),
  ('public-administration', 'administrative-assistant', 'Administrative Assistant', 'entry'),
  ('public-administration', 'public-administration-officer', 'Public Administration Officer', 'mid'),
  ('public-administration', 'district-administration-officer', 'District Administration Officer', 'senior'),
  ('public-administration', 'public-administration-director', 'Public Administration Director', 'lead'),
  ('public-administration', 'permanent-secretary', 'Permanent Secretary', 'executive'),
  ('technology', 'support-technician', 'Support Technician', 'entry'),
  ('technology', 'software-developer', 'Software Developer', 'mid'),
  ('technology', 'senior-software-engineer', 'Senior Software Engineer', 'senior'),
  ('technology', 'engineering-lead', 'Engineering Lead', 'lead'),
  ('technology', 'chief-technology-officer', 'Chief Technology Officer', 'executive'),
  ('logistics-supply-chain', 'warehouse-assistant', 'Warehouse Assistant', 'entry'),
  ('logistics-supply-chain', 'logistics-officer', 'Logistics Officer', 'mid'),
  ('logistics-supply-chain', 'supply-chain-manager', 'Supply Chain Manager', 'senior'),
  ('logistics-supply-chain', 'logistics-lead', 'Logistics Lead', 'lead'),
  ('logistics-supply-chain', 'supply-chain-executive', 'Supply Chain Executive', 'executive'),
  ('trade-retail', 'sales-assistant', 'Sales Assistant', 'entry'),
  ('trade-retail', 'sales-representative', 'Sales Representative', 'mid'),
  ('trade-retail', 'branch-manager', 'Branch Manager', 'senior'),
  ('trade-retail', 'retail-lead', 'Retail Lead', 'lead'),
  ('trade-retail', 'commercial-director', 'Commercial Director', 'executive'),
  ('hospitality-tourism', 'hospitality-assistant', 'Hospitality Assistant', 'entry'),
  ('hospitality-tourism', 'lodge-supervisor', 'Lodge Supervisor', 'mid'),
  ('hospitality-tourism', 'camp-manager', 'Camp Manager', 'senior'),
  ('hospitality-tourism', 'hospitality-lead', 'Hospitality Lead', 'lead'),
  ('hospitality-tourism', 'tourism-director', 'Tourism Director', 'executive'),
  ('creative-media', 'production-assistant', 'Production Assistant', 'entry'),
  ('creative-media', 'graphic-designer', 'Graphic Designer', 'mid'),
  ('creative-media', 'creative-director', 'Creative Director', 'senior'),
  ('creative-media', 'media-lead', 'Media Lead', 'lead'),
  ('creative-media', 'media-executive', 'Media Executive', 'executive'),
  ('professional-services', 'analyst', 'Analyst', 'entry'),
  ('professional-services', 'consultant', 'Consultant', 'mid'),
  ('professional-services', 'senior-consultant', 'Senior Consultant', 'senior'),
  ('professional-services', 'practice-lead', 'Practice Lead', 'lead'),
  ('professional-services', 'managing-partner', 'Managing Partner', 'executive'),
  ('manufacturing', 'production-operator', 'Production Operator', 'entry'),
  ('manufacturing', 'manufacturing-technician', 'Manufacturing Technician', 'mid'),
  ('manufacturing', 'plant-manager', 'Plant Manager', 'senior'),
  ('manufacturing', 'operations-lead', 'Operations Lead', 'lead'),
  ('manufacturing', 'manufacturing-director', 'Manufacturing Director', 'executive'),
  ('energy-utilities', 'utility-technician', 'Utility Technician', 'entry'),
  ('energy-utilities', 'electrical-engineer', 'Electrical Engineer', 'mid'),
  ('energy-utilities', 'energy-manager', 'Energy Manager', 'senior'),
  ('energy-utilities', 'utilities-lead', 'Utilities Lead', 'lead'),
  ('energy-utilities', 'energy-director', 'Energy Director', 'executive'),
  ('social-community', 'community-assistant', 'Community Assistant', 'entry'),
  ('social-community', 'programme-officer', 'Programme Officer', 'mid'),
  ('social-community', 'programme-manager', 'Programme Manager', 'senior'),
  ('social-community', 'country-director', 'Country Director', 'lead'),
  ('social-community', 'social-impact-executive', 'Social Impact Executive', 'executive')
) AS seeded(family_slug, slug, name, seniority)
JOIN career_families family ON family.slug = seeded.family_slug AND family.version = 1;

--> statement-breakpoint
INSERT INTO role_aliases (role_id, alias, normalized_alias, language, region)
SELECT role.id, seeded.alias, seeded.normalized_alias, seeded.language, seeded.region
FROM (VALUES
  ('accountant', 'Bursar', 'bursar', 'en', 'ZM'),
  ('camp-manager', 'Camp Manager', 'camp manager', 'en', 'ZM'),
  ('sales-representative', 'Marketeer', 'marketeer', 'en', 'ZM'),
  ('district-administration-officer', 'District Commissioner', 'district commissioner', 'en', 'ZM'),
  ('programme-officer', 'Community Development Officer', 'community development officer', 'en', 'ZM')
) AS seeded(role_slug, alias, normalized_alias, language, region)
JOIN career_roles role ON role.slug = seeded.role_slug AND role.version = 1;
