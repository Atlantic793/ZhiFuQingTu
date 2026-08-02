-- P1: multi-conversation chat history with structured messages

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '新对话',
  goal text not null default 'free'
    check (goal in ('career', 'courses', 'free')),
  subject_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant', 'tool')),
  content text,
  -- Forward-compatible GLM/OpenAI-style fields (tool_calls, tool_call_id, name, ...)
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_own"
  on public.conversations for select to authenticated
  using (auth.uid() = user_id);

create policy "conversations_insert_own"
  on public.conversations for insert to authenticated
  with check (auth.uid() = user_id);

create policy "conversations_update_own"
  on public.conversations for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "conversations_delete_own"
  on public.conversations for delete to authenticated
  using (auth.uid() = user_id);

create policy "messages_select_own"
  on public.messages for select to authenticated
  using (auth.uid() = user_id);

create policy "messages_insert_own"
  on public.messages for insert to authenticated
  with check (auth.uid() = user_id);

create policy "messages_update_own"
  on public.messages for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "messages_delete_own"
  on public.messages for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id
    and user_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_message_inserted on public.messages;

create trigger on_message_inserted
  after insert on public.messages
  for each row
  execute function public.touch_conversation_updated_at();
