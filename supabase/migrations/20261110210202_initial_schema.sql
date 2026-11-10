-- Acting — initial schema (v1)
-- Additive migration: profiles, admin_users, courses, lessons, enrollments.

create schema if not exists private;
revoke all on schema private from public;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  constraint profiles_full_name_length
    check (full_name is null or char_length(btrim(full_name)) between 1 and 120)
);

-- ---------- admin_users ----------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- courses (one row = one scheduled course) ----------
create table public.courses (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  starts_on date not null,
  ends_on date not null,
  capacity integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint courses_title_not_blank check (char_length(btrim(title)) between 1 and 160),
  constraint courses_dates_order check (ends_on >= starts_on),
  constraint courses_capacity_positive check (capacity > 0)
);

-- ---------- lessons ----------
create table public.lessons (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint lessons_time_order check (ends_at > starts_at),
  constraint lessons_course_slot_unique unique (course_id, starts_at)
);

-- ---------- enrollments ----------
create table public.enrollments (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id bigint not null references public.courses (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint enrollments_course_user_unique unique (course_id, user_id)
);

-- ---------- indexes ----------
create index courses_published_starts_on_idx
  on public.courses (starts_on)
  where is_published;

create index enrollments_user_id_idx
  on public.enrollments (user_id);

-- ---------- new user -> profile ----------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function private.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------- enrollment deadline helpers (school timezone: Europe/Rome) ----------
create or replace function private.student_can_enroll(p_course_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.is_published
      and c.starts_on > (now() at time zone 'Europe/Rome')::date
  );
$$;

create or replace function private.student_can_cancel(p_course_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.starts_on > (now() at time zone 'Europe/Rome')::date
  );
$$;

revoke all on function private.student_can_enroll(bigint) from public;
revoke all on function private.student_can_cancel(bigint) from public;
revoke all on function private.student_can_enroll(bigint) from anon;
revoke all on function private.student_can_cancel(bigint) from anon;

grant usage on schema private to authenticated;
grant execute on function private.student_can_enroll(bigint) to authenticated;
grant execute on function private.student_can_cancel(bigint) to authenticated;

-- ---------- capacity enforcement ----------
create or replace function private.enforce_course_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capacity integer;
  v_enrolled integer;
begin
  -- Duplicate pair: let the unique constraint report it correctly.
  if exists (
    select 1
    from public.enrollments e
    where e.course_id = new.course_id
      and e.user_id = new.user_id
  ) then
    return new;
  end if;

  -- Lock the course row to serialize concurrent enrollments for this course.
  select c.capacity
    into v_capacity
  from public.courses c
  where c.id = new.course_id
  for update;

  if not found then
    raise exception 'course_not_found' using errcode = 'P0001';
  end if;

  select count(*)
    into v_enrolled
  from public.enrollments e
  where e.course_id = new.course_id;

  if v_enrolled >= v_capacity then
    raise exception 'course_full' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_course_capacity() from public;
revoke all on function private.enforce_course_capacity() from anon, authenticated;

create trigger enforce_course_capacity
  before insert on public.enrollments
  for each row execute function private.enforce_course_capacity();

create or replace function private.prevent_capacity_reduction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrolled integer;
begin
  if new.capacity < old.capacity then
    select count(*)
      into v_enrolled
    from public.enrollments e
    where e.course_id = new.id;

    if new.capacity < v_enrolled then
      raise exception 'capacity_below_enrollments' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_capacity_reduction() from public;
revoke all on function private.prevent_capacity_reduction() from anon, authenticated;

create trigger prevent_capacity_reduction
  before update of capacity on public.courses
  for each row execute function private.prevent_capacity_reduction();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- admin_users: read own row only; writes are SQL/service-role only
create policy admin_users_select_own on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- courses
create policy courses_select_published on public.courses
  for select to anon, authenticated
  using (is_published);

create policy courses_select_enrolled on public.courses
  for select to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = courses.id
        and e.user_id = (select auth.uid())
    )
  );

create policy courses_select_admin on public.courses
  for select to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy courses_insert_admin on public.courses
  for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy courses_update_admin on public.courses
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

-- lessons
create policy lessons_select_published on public.lessons
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id
        and c.is_published
    )
  );

create policy lessons_select_enrolled on public.lessons
  for select to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = lessons.course_id
        and e.user_id = (select auth.uid())
    )
  );

create policy lessons_select_admin on public.lessons
  for select to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy lessons_insert_admin on public.lessons
  for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy lessons_update_admin on public.lessons
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy lessons_delete_admin on public.lessons
  for delete to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

-- enrollments
create policy enrollments_select_own on public.enrollments
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy enrollments_select_admin on public.enrollments
  for select to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy enrollments_insert_own on public.enrollments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.student_can_enroll(course_id))
  );

create policy enrollments_delete_own on public.enrollments
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and (select private.student_can_cancel(course_id))
  );

create policy enrollments_insert_admin on public.enrollments
  for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

create policy enrollments_delete_admin on public.enrollments
  for delete to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = (select auth.uid())
    )
  );

-- ---------- grants (Data API is not auto-exposed) ----------
grant usage on schema public to anon, authenticated;

grant select on public.courses to anon;
grant select on public.lessons to anon;

grant select, insert, update on public.courses to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

grant select on public.admin_users to authenticated;

grant select, insert, delete on public.enrollments to authenticated;

grant usage on sequence public.courses_id_seq to authenticated;
grant usage on sequence public.lessons_id_seq to authenticated;
grant usage on sequence public.enrollments_id_seq to authenticated;
