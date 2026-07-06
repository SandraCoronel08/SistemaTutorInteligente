-- rls-policies.sql
-- Tutor Inteligente AED I - Row Level Security policies
-- Execute this file after database/schema.sql.

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.knowledge_topics enable row level security;
alter table public.academic_materials enable row level security;

drop policy if exists "Users can read own chat sessions" on public.chat_sessions;
drop policy if exists "Users can create own chat sessions" on public.chat_sessions;
drop policy if exists "Users can update own chat sessions" on public.chat_sessions;
drop policy if exists "Users can delete own chat sessions" on public.chat_sessions;

create policy "Users can read own chat sessions"
on public.chat_sessions
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can create own chat sessions"
on public.chat_sessions
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can update own chat sessions"
on public.chat_sessions
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can delete own chat sessions"
on public.chat_sessions
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can read own chat messages" on public.chat_messages;
drop policy if exists "Users can create own chat messages" on public.chat_messages;
drop policy if exists "Users can update own chat messages" on public.chat_messages;
drop policy if exists "Users can delete own chat messages" on public.chat_messages;

create policy "Users can read own chat messages"
on public.chat_messages
for select
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
  )
);

create policy "Users can create own chat messages"
on public.chat_messages
for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
  )
);

create policy "Users can update own chat messages"
on public.chat_messages
for update
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
  )
)
with check (
  auth.uid() is not null
  and auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
  )
);

create policy "Users can delete own chat messages"
on public.chat_messages
for delete
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Authenticated users can read knowledge topics" on public.knowledge_topics;
drop policy if exists "Authenticated users can read academic materials" on public.academic_materials;

create policy "Authenticated users can read knowledge topics"
on public.knowledge_topics
for select
to authenticated
using (true);

create policy "Authenticated users can read academic materials"
on public.academic_materials
for select
to authenticated
using (true);
