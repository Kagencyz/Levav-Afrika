-- Custom SQL migration file, put your code below! --

-- =====================================================================
-- Post-schema security migration: Supabase Auth profile sync +
-- levav_app privileges
-- =====================================================================
-- Runs after 0000 (levav_app role exists) and 0001 (tables exist) —
-- everything here references one or both. Does NOT recreate the role
-- (already created and hardened in 0000_levav_app_role.sql).

-- ---------------------------------------------------------------------
-- 1. Signup profile-sync trigger
-- ---------------------------------------------------------------------
-- search_path = '' (not 'public'): every reference below is either
-- already fully schema-qualified (public.users) or a pg_catalog builtin
-- (trim/coalesce/nullif/left/lower, the ->> operator, IS DISTINCT FROM) —
-- pg_catalog is always implicitly resolvable regardless of search_path,
-- so nothing here depends on an attacker-controllable search path.
--
-- Email-only identity for Slice 1: this only confirms an email address
-- exists on the auth.users row being inserted (auth.users inserts can
-- happen before email confirmation) — it does not and cannot assert the
-- email is verified. Verification remains entirely Supabase Auth's own
-- responsibility, tracked on auth.users, not duplicated here.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_name text;
  safe_name text;
begin
  if new.email is null then
    raise exception 'Levav requires an email address for signup. Phone-only signup and identity providers that return no email are not supported in Slice 1.';
  end if;

  raw_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );
  safe_name := left(coalesce(raw_name, 'New User'), 120);

  insert into public.users (id, email, name, access_level)
  values (new.id, lower(trim(new.email)), safe_name, 'standard');

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the matching public.users row when a new auth.users row is inserted. SECURITY DEFINER, owned by postgres, search_path pinned empty. Enforces email-based identity for Slice 1 (existence only, not verification) and applies safe display-name extraction. Never reads accessLevel or any authorization field from metadata.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. Email synchronisation trigger
-- ---------------------------------------------------------------------
-- Same email-only identity invariant applies here: an update that would
-- remove the account's email entirely is rejected, not silently applied.
create function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    raise exception 'Levav requires an email address. Removing the account email is not supported in Slice 1.';
  end if;

  if new.email is distinct from old.email then
    update public.users
    set email = lower(trim(new.email)), updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$;

comment on function public.handle_user_email_update() is
  'Keeps public.users.email in sync when auth.users.email changes. SECURITY DEFINER, owned by postgres, search_path pinned empty. Rejects updates that would remove the account email entirely.';

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  execute function public.handle_user_email_update();

-- ---------------------------------------------------------------------
-- 3. Explicit, stable function ownership
-- ---------------------------------------------------------------------
-- `postgres` is the fixed root/owner role present in every Supabase
-- project — local (CLI-provisioned Docker Postgres) and hosted
-- (staging/production) — so this is portable across all three
-- environments without modification.
alter function public.handle_new_user() owner to postgres;
alter function public.handle_user_email_update() owner to postgres;

-- ---------------------------------------------------------------------
-- 4. Lock down direct function execution — trigger entry points only,
--    never public RPC functions.
-- ---------------------------------------------------------------------
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
revoke all on function public.handle_new_user() from levav_app;

revoke all on function public.handle_user_email_update() from public;
revoke all on function public.handle_user_email_update() from anon;
revoke all on function public.handle_user_email_update() from authenticated;
revoke all on function public.handle_user_email_update() from levav_app;

-- ---------------------------------------------------------------------
-- 5. Database / schema / table privileges — levav_app only
-- ---------------------------------------------------------------------
-- levav_app itself already exists (0000_levav_app_role.sql) — this
-- section only grants privileges, it does not create or alter the role.
do $$
begin
  execute format('grant connect on database %I to levav_app', current_database());
end
$$;

grant usage on schema public to levav_app;

grant select on public.users to levav_app;
grant select, insert, update on public.talents to levav_app;
grant select, insert, update on public.organizations to levav_app;
grant select, insert, update on public.organization_members to levav_app;

-- No DELETE, no TRUNCATE, no REFERENCES, no TRIGGER privilege, no
-- sequence privileges (no serial/bigserial columns exist anywhere — every
-- PK is gen_random_uuid()), no default privileges (future tables get
-- their own explicit, reviewed grants in their own migration, never
-- silent inheritance via ALTER DEFAULT PRIVILEGES).

-- ---------------------------------------------------------------------
-- 6. Explicit revocation from PUBLIC, anon, authenticated
-- ---------------------------------------------------------------------
-- Slice 1: Hono/tRPC through levav_app is the ONLY application data
-- path. The authenticated-role RLS policies already created in
-- 0001_bouncy_jamie_braddock.sql remain defined (defence for a future
-- approved gateway path) but are deliberately left inert: Postgres
-- checks table-level GRANT before RLS is even evaluated, so with no
-- grant, "authenticated" is denied regardless of what any policy says.
-- service_role is deliberately left untouched — outside this
-- checkpoint's scope, not altered here.
revoke all on public.users, public.talents, public.organizations, public.organization_members
  from public, anon, authenticated;
