-- Review and execute manually in Supabase before enabling profile photos and error reports.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users manage their own profile avatar" on storage.objects;

create policy "Users manage their own profile avatar"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('tutor_response', 'interface', 'account', 'other')),
  description text not null check (char_length(trim(description)) between 10 and 2000),
  activity text check (activity is null or char_length(trim(activity)) between 1 and 500),
  route text check (route is null or char_length(trim(route)) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists error_reports_user_id_created_at_idx
  on public.error_reports (user_id, created_at desc);

alter table public.error_reports enable row level security;

drop policy if exists "Users can create their own error reports" on public.error_reports;

create policy "Users can create their own error reports"
on public.error_reports
for insert
to authenticated
with check (user_id = auth.uid());
