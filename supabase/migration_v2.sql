-- Migration v2: add listing + announcement types, new columns, storage bucket

-- 1. Update type constraint
alter table posts drop constraint if exists posts_type_check;
alter table posts add constraint posts_type_check
  check (type in ('event', 'question', 'listing', 'announcement'));

-- 2. New columns
alter table posts add column if not exists price numeric;
alter table posts add column if not exists condition text check (condition in ('new', 'used'));
alter table posts add column if not exists images text[] default '{}';
alter table posts add column if not exists is_answered boolean default false;
alter table posts add column if not exists lat double precision;
alter table posts add column if not exists lng double precision;
alter table posts add column if not exists address text;

-- 3. Delete policy (was missing)
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'posts_delete_own' and tablename = 'posts'
  ) then
    execute 'create policy "posts_delete_own" on posts for delete using (auth.uid() = author_id)';
  end if;
end $$;

-- 4. Storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'storage_select_public' and tablename = 'objects'
  ) then
    execute 'create policy "storage_select_public" on storage.objects for select using (bucket_id = ''post-images'')';
  end if;
  if not exists (
    select 1 from pg_policies where policyname = 'storage_insert_auth' and tablename = 'objects'
  ) then
    execute 'create policy "storage_insert_auth" on storage.objects for insert with check (bucket_id = ''post-images'' and auth.role() = ''authenticated'')';
  end if;
  if not exists (
    select 1 from pg_policies where policyname = 'storage_delete_own' and tablename = 'objects'
  ) then
    execute 'create policy "storage_delete_own" on storage.objects for delete using (bucket_id = ''post-images'' and auth.uid()::text = owner)';
  end if;
end $$;
