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

-- Re-asserted unconditionally every time this migration runs, even if
-- the role already existed with different attributes. No PASSWORD
-- clause here either — omitting it never touches whatever password (or
-- lack of one) is already set.
alter role levav_app
  with login
  noinherit
  nocreatedb
  nocreaterole
  nosuperuser
  noreplication
  nobypassrls;
