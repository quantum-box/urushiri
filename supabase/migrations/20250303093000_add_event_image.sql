-- Add optional image_url column to events table
alter table if exists public.events
  add column if not exists image_url text;

-- Ensure dedicated storage bucket exists for event images
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- RLS policies for event image bucket
drop policy if exists "Event images are publicly readable" on storage.objects;
create policy "Event images are publicly readable"
  on storage.objects
  for select
  using (
    bucket_id = 'event-images'
  );

drop policy if exists "Event images inserts require owner" on storage.objects;
create policy "Event images inserts require owner"
  on storage.objects
  for insert
  with check (
    bucket_id = 'event-images'
    and auth.uid() = owner
  );

drop policy if exists "Event images updates require owner" on storage.objects;
create policy "Event images updates require owner"
  on storage.objects
  for update
  using (
    bucket_id = 'event-images'
    and auth.uid() = owner
  )
  with check (
    bucket_id = 'event-images'
    and auth.uid() = owner
  );

drop policy if exists "Event images deletions require owner" on storage.objects;
create policy "Event images deletions require owner"
  on storage.objects
  for delete
  using (
    bucket_id = 'event-images'
    and auth.uid() = owner
  );
