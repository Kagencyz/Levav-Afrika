-- Reconcile the original custom-password schema with Supabase Auth.
-- public.users remains an application profile table; auth.users owns all
-- credentials. The legacy password_hash column is retained nullable for a
-- reversible rollout and can be removed in a later cleanup migration.

alter table public.users alter column password_hash drop not null;
alter table public.users alter column id drop default;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_id_auth_users_id_fk'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_id_auth_users_id_fk
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end
$$;

create or replace function public.handle_new_user()
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
    raise exception 'Levav requires an email address.';
  end if;

  raw_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );
  safe_name := left(coalesce(raw_name, 'New User'), 200);

  insert into public.users (id, email, name, access_level)
  values (new.id, lower(trim(new.email)), safe_name, 'standard');
  return new;
end;
$$;

create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    raise exception 'Levav requires an email address.';
  end if;
  if new.email is distinct from old.email then
    update public.users
      set email = lower(trim(new.email)), updated_at = now()
      where id = new.id;
  end if;
  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;
alter function public.handle_user_email_update() owner to postgres;
revoke all on function public.handle_new_user() from public, anon, authenticated, levav_app;
revoke all on function public.handle_user_email_update() from public, anon, authenticated, levav_app;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();

alter table public.users enable row level security;
alter table public.talents enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.user_onboarding enable row level security;

drop policy if exists levav_app_all on public.users;
drop policy if exists levav_app_all on public.talents;
drop policy if exists levav_app_all on public.organizations;
drop policy if exists levav_app_all on public.organization_members;
drop policy if exists levav_app_all on public.user_onboarding;

create policy users_select_own on public.users for select to authenticated
  using ((select auth.uid()) = id);
create policy users_service_select on public.users for select to levav_app using (true);

create policy talents_select_own on public.talents for select to authenticated
  using ((select auth.uid()) = user_id);
create policy talents_insert_own on public.talents for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy talents_update_own on public.talents for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy talents_service_select on public.talents for select to levav_app using (true);
create policy talents_service_insert on public.talents for insert to levav_app with check (true);
create policy talents_service_update on public.talents for update to levav_app
  using (true) with check (true);

create policy organizations_service_select on public.organizations for select to levav_app using (true);
create policy organizations_service_insert on public.organizations for insert to levav_app with check (true);
create policy organizations_service_update on public.organizations for update to levav_app
  using (true) with check (true);

create policy org_members_service_select on public.organization_members for select to levav_app using (true);
create policy org_members_service_insert on public.organization_members for insert to levav_app with check (true);
create policy org_members_service_update on public.organization_members for update to levav_app
  using (true) with check (true);

create policy user_onboarding_select_own on public.user_onboarding for select to authenticated
  using ((select auth.uid()) = user_id);
create policy user_onboarding_insert_own on public.user_onboarding for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy user_onboarding_update_own on public.user_onboarding for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_onboarding_service_select on public.user_onboarding for select to levav_app using (true);
create policy user_onboarding_service_insert on public.user_onboarding for insert to levav_app with check (true);
create policy user_onboarding_service_update on public.user_onboarding for update to levav_app
  using (true) with check (true);

revoke all on public.users, public.talents, public.organizations,
  public.organization_members, public.user_onboarding from levav_app;
grant select on public.users to levav_app;
grant select, insert, update on public.talents, public.organizations,
  public.organization_members, public.user_onboarding to levav_app;

revoke all on public.users, public.talents, public.organizations,
  public.organization_members, public.user_onboarding from public, anon, authenticated;
