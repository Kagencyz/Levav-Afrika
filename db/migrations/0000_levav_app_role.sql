-- Custom SQL migration file, put your code below! --

-- =====================================================================
-- levav_app role — creation only, no dependents
-- =====================================================================
-- Split into its own, earliest migration because the next migration's
-- generated RLS policies (CREATE POLICY ... TO levav_app) require this
-- role to already exist in Postgres at the moment they run. Role
-- creation must precede table/policy creation; everything else that
-- references this role (grants, triggers) must instead follow table
-- creation — that's what the third migration is for. This file exists
-- solely to satisfy that ordering; nothing here depends on any table.
--
-- No PASSWORD clause — the credential is an out-of-band, per-environment
-- secret, set separately, never part of this file.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'levav_app') then
    create role levav_app with login noinherit nocreatedb nocreaterole nosuperuser noreplication nobypassrls;
  end if;
end
$$;

-- Re-asserted every time this migration runs, in case the role already
-- existed with different attributes. No PASSWORD clause here either —
-- omitting it never touches whatever password (or lack of one) is set.
--
-- Two deliberate differences from the CREATE above (defect F-08):
--
-- 1. NOSUPERUSER is omitted. On PostgreSQL 17, ALTER ROLE ... NOSUPERUSER
--    is rejected unless the caller is itself a superuser — even when the
--    target role already lacks the attribute and the statement would be a
--    no-op. Supabase applies migrations as `postgres`, which is not a
--    superuser, so including it failed the whole migration. The CREATE
--    above already sets NOSUPERUSER, and nothing in this project ever
--    grants it, so re-asserting it bought nothing and cost everything.
--
-- 2. The statement is wrapped so insufficient privilege is survivable.
--    A managed platform may restrict ALTER ROLE further in future; if it
--    does, the role still exists with the attributes CREATE gave it, and
--    a schema rebuild must not fail over an attribute re-assertion.
--
-- Before this fix a fresh database could not be built from these
-- migrations at all: 0000 is atomic, so the failed ALTER rolled back the
-- CREATE and levav_app was never created. Verified against a clean
-- PostgreSQL 17 instance.
do $$
begin
  alter role levav_app
    with login
    noinherit
    nocreatedb
    nocreaterole
    noreplication
    nobypassrls;
exception
  when insufficient_privilege then
    raise notice 'levav_app attributes left unchanged: insufficient privilege to alter role';
end
$$;
