-- Nha Trang Connect — MVP veritabanı şeması
-- Supabase SQL Editor'a yapıştırıp çalıştır.

create extension if not exists "pgcrypto";

-- Profiller: auth.users ile bire bir eşleşir
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  bio text,
  user_type text not null check (user_type in ('tourist', 'expat')),
  interests text[] default '{}',
  created_at timestamptz default now()
);

-- Postlar: hem etkinlik hem soru aynı tabloda, "type" alanı ayırır
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('event', 'question')),
  title text not null,
  description text,
  category text, -- örn: 'para', 'alisveris', 'saglik', 'ulasim', 'eglence'
  event_date timestamptz, -- sadece type='event' için kullanılır
  location text, -- sadece type='event' için kullanılır
  created_at timestamptz default now()
);

-- Etkinlik katılımcıları
create table if not exists event_participants (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- Soru cevapları
create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  is_best boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security: herkes okuyabilir, sadece kendi verisini yazabilir
alter table profiles enable row level security;
alter table posts enable row level security;
alter table event_participants enable row level security;
alter table answers enable row level security;

create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "posts_select_all" on posts for select using (true);
create policy "posts_insert_own" on posts for insert with check (auth.uid() = author_id);
create policy "posts_update_own" on posts for update using (auth.uid() = author_id);

create policy "participants_select_all" on event_participants for select using (true);
create policy "participants_insert_own" on event_participants for insert with check (auth.uid() = user_id);
create policy "participants_delete_own" on event_participants for delete using (auth.uid() = user_id);

create policy "answers_select_all" on answers for select using (true);
create policy "answers_insert_own" on answers for insert with check (auth.uid() = author_id);
create policy "answers_update_own_or_post_owner" on answers for update using (
  auth.uid() = author_id
  or auth.uid() = (select author_id from posts where posts.id = answers.post_id)
);
