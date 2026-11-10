-- Acting — tighten API grants
-- Supabase default privileges add TRUNCATE/REFERENCES/TRIGGER to new tables.
-- Remove everything that is not strictly needed by the Data API roles.

revoke truncate, references, trigger on public.profiles from anon, authenticated;
revoke truncate, references, trigger on public.admin_users from anon, authenticated;
revoke truncate, references, trigger on public.courses from anon, authenticated;
revoke truncate, references, trigger on public.lessons from anon, authenticated;
revoke truncate, references, trigger on public.enrollments from anon, authenticated;

-- anon: public catalog only
revoke all on public.profiles from anon;
revoke all on public.admin_users from anon;
revoke all on public.enrollments from anon;
revoke insert, update, delete on public.courses from anon;
revoke insert, update, delete on public.lessons from anon;

-- authenticated: keep only the approved privileges
revoke insert, delete on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
revoke insert, update, delete on public.admin_users from authenticated;
revoke delete on public.courses from authenticated;
revoke update on public.enrollments from authenticated;
