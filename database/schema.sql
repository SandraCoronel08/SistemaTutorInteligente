--schema.sql
-- Tutor Inteligente AED I - Supabase schema
-- Execute this file first in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nueva conversacion',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_sessions_title_length check (char_length(trim(title)) between 1 and 120)
);

create index if not exists chat_sessions_user_id_idx
  on public.chat_sessions(user_id);

create index if not exists chat_sessions_updated_at_idx
  on public.chat_sessions(updated_at desc);

drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;

create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  topic text,
  difficulty text,
  created_at timestamptz not null default now(),
  constraint chat_messages_role_check check (role in ('user', 'assistant')),
  constraint chat_messages_content_not_empty check (char_length(trim(content)) > 0),
  constraint chat_messages_difficulty_check check (
    difficulty is null
    or difficulty in ('basico', 'intermedio', 'avanzado')
  )
);

create index if not exists chat_messages_session_id_idx
  on public.chat_messages(session_id);

create index if not exists chat_messages_user_id_idx
  on public.chat_messages(user_id);

create index if not exists chat_messages_created_at_idx
  on public.chat_messages(created_at asc);

create table if not exists public.knowledge_topics (
  id uuid primary key default gen_random_uuid(),
  unit text not null,
  topic text not null,
  subtopic text,
  difficulty text not null default 'basico',
  description text not null,
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_topics_difficulty_check check (
    difficulty in ('basico', 'intermedio', 'avanzado')
  ),
  constraint knowledge_topics_unit_not_empty check (char_length(trim(unit)) > 0),
  constraint knowledge_topics_topic_not_empty check (char_length(trim(topic)) > 0),
  constraint knowledge_topics_description_not_empty check (char_length(trim(description)) > 0),
  constraint knowledge_topics_unit_topic_subtopic_key unique (unit, topic, subtopic)
);

create index if not exists knowledge_topics_topic_idx
  on public.knowledge_topics(topic);

create index if not exists knowledge_topics_keywords_idx
  on public.knowledge_topics using gin(keywords);

drop trigger if exists set_knowledge_topics_updated_at on public.knowledge_topics;

create trigger set_knowledge_topics_updated_at
before update on public.knowledge_topics
for each row
execute function public.set_updated_at();

create table if not exists public.academic_materials (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.knowledge_topics(id) on delete cascade,
  title text not null,
  content text not null,
  source text,
  type text not null default 'teoria',
  difficulty text not null default 'basico',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_materials_type_check check (
    type in ('teoria', 'ejemplo', 'ejercicio', 'bibliografia', 'guia')
  ),
  constraint academic_materials_difficulty_check check (
    difficulty in ('basico', 'intermedio', 'avanzado')
  ),
  constraint academic_materials_title_not_empty check (char_length(trim(title)) > 0),
  constraint academic_materials_content_not_empty check (char_length(trim(content)) > 0),
  constraint academic_materials_topic_title_key unique (topic_id, title)
);

create index if not exists academic_materials_topic_id_idx
  on public.academic_materials(topic_id);

create index if not exists academic_materials_type_idx
  on public.academic_materials(type);

drop trigger if exists set_academic_materials_updated_at on public.academic_materials;

create trigger set_academic_materials_updated_at
before update on public.academic_materials
for each row
execute function public.set_updated_at();
