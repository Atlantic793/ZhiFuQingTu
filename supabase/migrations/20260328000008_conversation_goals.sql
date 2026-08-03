-- Allow four agent modes: career / courses / training / free
alter table public.conversations
  drop constraint if exists conversations_goal_check;

alter table public.conversations
  add constraint conversations_goal_check
  check (goal in ('career', 'courses', 'training', 'free'));
